resource "aws_ecs_service" "app_service" {
  name                   = "app-service"
  cluster                = var.ecs_cluster.id
  task_definition        = aws_ecs_task_definition.app.arn
  desired_count          = 1
  enable_execute_command = true

  launch_type = "FARGATE"

  network_configuration {
    subnets          = var.public_subnets
    security_groups  = [aws_security_group.app_sg.id]
    assign_public_ip = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.ecs_task_execution_policy,
    aws_iam_role.ecs_task_role,
    aws_iam_role.ecs_execution_role
  ]
}
