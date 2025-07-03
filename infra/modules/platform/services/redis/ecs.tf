resource "aws_ecs_service" "redis" {
  name            = "redis"
  cluster         = var.ecs_cluster.id
  task_definition = aws_ecs_task_definition.redis.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = var.public_subnets
    security_groups  = [aws_security_group.redis_sg.id]
    assign_public_ip = true
  }

  service_registries {
    registry_arn = aws_service_discovery_service.redis.arn
  }
}
