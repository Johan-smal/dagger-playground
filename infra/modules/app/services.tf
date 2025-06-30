module "app" {
  source             = "./services/app"
  ecs_cluster        = aws_ecs_cluster.app_cluster
  aws_region         = var.aws_region
  public_subnets     = data.aws_subnets.default.ids
  app_key_secret_arn = aws_secretsmanager_secret.app_key.arn
  app_ecr            = var.app_ecr
  vpc_id             = data.aws_vpc.default.id
}

module "redis" {
  source                                  = "./services/redis"
  ecs_cluster                             = aws_ecs_cluster.app_cluster
  aws_region                              = var.aws_region
  public_subnets                          = data.aws_subnets.default.ids
  service_discovery_private_dns_namespace = aws_service_discovery_private_dns_namespace.main
  app_sg                                  = module.app.app_sg
  vpc_id                                  = data.aws_vpc.default.id
}
