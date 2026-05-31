-- 黑曜智流 AI：任務人工審核 RPC
-- 用途：讓後台管理員審核 task_completions.pending，不允許會員透過任務升級管理員。

create or replace function public.admin_review_task_completion(
  p_completion_id uuid,
  p_approved boolean,
  p_reason text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_completion public.task_completions%rowtype;
  v_task public.tasks%rowtype;
  v_before jsonb;
  v_after jsonb;
  v_tx uuid;
begin
  if v_actor is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  if public.current_role_level() < 40 then
    return jsonb_build_object('ok', false, 'message', '你的帳號權限不足，無法審核任務。');
  end if;

  select * into v_completion
  from public.task_completions
  where id = p_completion_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到任務提交紀錄。');
  end if;

  if v_completion.status <> 'pending' then
    return jsonb_build_object('ok', false, 'message', '此任務已處理，不能重複審核。');
  end if;

  select * into v_task
  from public.tasks
  where id = v_completion.task_id;

  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到任務資料。');
  end if;

  v_before := to_jsonb(v_completion);

  if p_approved then
    v_tx := public.apply_point_transaction(
      v_completion.user_id,
      'task',
      v_task.title,
      v_task.reward_points,
      'posted',
      'task_completions',
      p_completion_id::text,
      '任務審核通過',
      'task-review:' || p_completion_id::text
    );

    update public.task_completions
    set status = 'completed',
        point_transaction_id = v_tx,
        reviewed_by = v_actor,
        reviewed_at = timezone('utc', now())
    where id = p_completion_id
    returning to_jsonb(public.task_completions.*) into v_after;
  else
    update public.task_completions
    set status = 'failed',
        reviewed_by = v_actor,
        reviewed_at = timezone('utc', now())
    where id = p_completion_id
    returning to_jsonb(public.task_completions.*) into v_after;
  end if;

  perform public.write_audit_log(
    'admin_review_task_completion',
    'task_completions',
    p_completion_id::text,
    v_before,
    v_after,
    coalesce(nullif(p_reason, ''), case when p_approved then '審核通過' else '審核拒絕' end)
  );

  return jsonb_build_object(
    'ok', true,
    'message', case when p_approved then '任務審核已通過。' else '任務已拒絕。' end,
    'status', case when p_approved then 'completed' else 'failed' end,
    'point_transaction_id', v_tx
  );
end;
$$;

revoke all on function public.admin_review_task_completion(uuid, boolean, text) from public, anon;
grant execute on function public.admin_review_task_completion(uuid, boolean, text) to authenticated;