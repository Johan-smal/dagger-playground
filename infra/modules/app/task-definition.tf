resource "aws_cloudwatch_log_group" "app_log_group" {
  name              = "/ecs/app"
  retention_in_days = 1
}

resource "aws_ecs_task_definition" "app" {
  family                   = "app-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  # Uncomment the following lines if you want to specify a specific runtime platform
  # runtime_platform {
  #   cpu_architecture = "ARM64"
  #   operating_system_family = "LINUX"
  # }

  container_definitions = jsonencode([
    {
      name      = "app-container"
      image     = "${var.app_ecr.repository_url}:latest"
      essential = true
      command   = ["php", "artisan", "serve", "--port=80", "--host=0.0.0"]
      environment = [
        { name = "APP_ENV", value = "production" },
        { name = "APP_DEBUG", value = "false" },
        { name = "REDIS_HOST", value = "redis.local" },
        { name = "REDIS_PORT", value = "6379" }
      ]
      secrets = [
        { name = "APP_KEY", valueFrom = aws_secretsmanager_secret.app_key.arn },
      ]
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.app_log_group.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "redis" {
  family                   = "redis-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

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
