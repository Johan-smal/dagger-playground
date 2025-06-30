resource "aws_service_discovery_private_dns_namespace" "main" {
  name = "local"
  vpc  = data.aws_vpc.default.id
}
