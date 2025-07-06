output "laravel_sg" {
  value = aws_security_group.laravel_sg
}
output "laravel_discover_service" {
  value = aws_service_discovery_service.php
}
