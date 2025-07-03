output "app_sg" {
  value = aws_security_group.app_sg
}
output "app_discover_service" {
  value = aws_service_discovery_service.php
}
