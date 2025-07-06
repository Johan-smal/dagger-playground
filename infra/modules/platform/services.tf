module "laravel" {
  source                                  = "./services/laravel"
  ecs_cluster                             = aws_ecs_cluster.app_cluster
  aws_region                              = var.aws_region
  public_subnets                          = data.aws_subnets.default.ids
  app_key_secret_arn                      = aws_secretsmanager_secret.app_key.arn
  app_ecr                                 = var.laravel_ecr
  vpc_id                                  = data.aws_vpc.default.id
  service_discovery_private_dns_namespace = aws_service_discovery_private_dns_namespace.main
}

module "redis" {
  source                                  = "./services/redis"
  ecs_cluster                             = aws_ecs_cluster.app_cluster
  aws_region                              = var.aws_region
  public_subnets                          = data.aws_subnets.default.ids
  service_discovery_private_dns_namespace = aws_service_discovery_private_dns_namespace.main
  laravel_sg                              = module.laravel.laravel_sg
  vpc_id                                  = data.aws_vpc.default.id
}
