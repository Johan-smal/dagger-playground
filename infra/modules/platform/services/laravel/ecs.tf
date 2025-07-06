resource "aws_ecs_service" "laravel_service" {
  name                   = "laravel-service"
  cluster                = var.ecs_cluster.id
  task_definition        = aws_ecs_task_definition.laravel.arn
  desired_count          = 1
  enable_execute_command = true

  launch_type = "FARGATE"

  network_configuration {
    subnets          = var.public_subnets
    security_groups  = [aws_security_group.laravel_sg.id]
    assign_public_ip = true
  }

  service_registries {
    registry_arn = aws_service_discovery_service.php.arn
    port         = 80
  }

  depends_on = [
    aws_iam_role_policy_attachment.ecs_task_execution_policy,
    aws_iam_role.ecs_task_role,
    aws_iam_role.ecs_execution_role
  ]
}
