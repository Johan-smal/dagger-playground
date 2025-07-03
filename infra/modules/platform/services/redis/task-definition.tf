resource "aws_ecs_task_definition" "redis" {
  family                   = "redis-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "redis"
      image = "redis:alpine"
      portMappings = [
        {
          containerPort = 6379
          protocol      = "tcp"
        }
      ]
    }
  ])
}
