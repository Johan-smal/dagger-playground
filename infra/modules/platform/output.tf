output "api_gateway_endpoint" {
  description = "The endpoint URL of the API Gateway HTTP API."
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}
