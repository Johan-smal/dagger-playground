resource "aws_ecs_task_definition" "app" {
  family                   = "app-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  # Uncomment the following lines if you want to specify a specific runtime platform
  runtime_platform {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }

  volume {
    name = "log-volume"
  }

  container_definitions = jsonencode([
    {
      name      = "php"
      image     = "${var.app_ecr.repository_url}:latest"
      essential = true
      command   = ["php", "artisan", "serve", "--port=80", "--host=0.0.0"]
      environment = [
        { name = "APP_ENV", value = "production" },
        { name = "APP_DEBUG", value = "false" },
        { name = "REDIS_HOST", value = "redis.local" },
        { name = "REDIS_PORT", value = "6379" },
        { name = "QUEUE_CONNECTION", value = "redis" }
      ]
      secrets = [
        { name = "APP_KEY", valueFrom = var.app_key_secret_arn },
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
          awslogs-stream-prefix = "app"
        }
      }
      mountPoints = [
        {
          sourceVolume  = "log-volume"
          containerPath = "/var/www/storage/logs"
        }
      ]
      }, {
      name      = "supervisor"
      image     = "${var.app_ecr.repository_url}:latest"
      essential = false
      command   = ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
      environment = [
        { name = "APP_ENV", value = "production" },
        { name = "APP_DEBUG", value = "false" },
        { name = "REDIS_HOST", value = "redis.local" },
        { name = "REDIS_PORT", value = "6379" },
        { name = "QUEUE_CONNECTION", value = "redis" }
      ]
      secrets = [
        { name = "APP_KEY", valueFrom = var.app_key_secret_arn },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.app_log_group.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "app"
        }
      }
      mountPoints = [
        {
          sourceVolume  = "log-volume"
          containerPath = "/var/www/storage/logs"
        }
      ]
      }, {
      name      = "fluent"
      image     = "amazon/aws-for-fluent-bit:latest"
      essential = false
      environment = [
        { name = "aws_fluent_bit_init_s3_1", value = aws_s3_object.fluent.arn }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.app_log_group.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "app"
        }
      }
      mountPoints = [
        {
          sourceVolume  = "log-volume"
          containerPath = "/var/www/storage/logs"
          readOnly      = true
        }
      ]
      command = [
        "/fluent-bit/bin/fluent-bit",
        "-i", "tail",
        "-p", "path=/var/www/storage/logs/laravel.log",
        "-p", "read_from_head=true",
        "-o", "cloudwatch_logs",
        "-p", "log_group_name=${aws_cloudwatch_log_group.app_log_group.name}",
        "-p", "log_stream_name=/app/laravel.log",
        "-p", "region=${var.aws_region}"
      ]
      # command = [
      #   "/fluent-bit/bin/fluent-bit",
      #   // Input for web log
      #   "-i", "tail",
      #   "-p", "path=/var/www/storage/logs/laravel.web.log",
      #   "-p", "read_from_head=true",
      #   "-p", "tag=web",
      #   // Input for queue log
      #   "-i", "tail",
      #   "-p", "path=/var/www/storage/logs/laravel.queue.log",
      #   "-p", "read_from_head=true",
      #   "-p", "tag=queue",
      #   // Output for web log
      #   "-o", "cloudwatch_logs",
      #   "-p", "match=web",
      #   "-p", "log_group_name=${aws_cloudwatch_log_group.app_log_group.name}",
      #   "-p", "log_stream_name=laravel.web.log",
      #   "-p", "region=${var.aws_region}",
      #   // Output for queue log
      #   "-o", "cloudwatch_logs",
      #   "-p", "match=queue",
      #   "-p", "log_group_name=${aws_cloudwatch_log_group.app_log_group.name}",
      #   "-p", "log_stream_name=laravel.queue.log",
      #   "-p", "region=${var.aws_region}"
      # ]
  }])
}
