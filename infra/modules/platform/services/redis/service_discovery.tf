resource "aws_service_discovery_service" "redis" {
  name = "redis"

  dns_config {
    namespace_id = var.service_discovery_private_dns_namespace.id

    dns_records {
      type = "A"
      ttl  = 10
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}
