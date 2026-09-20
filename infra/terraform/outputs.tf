output "elastic_ip" {
  description = "Public IP of the app server"
  value       = aws_eip.app.public_ip
}

output "ssh_command" {
  description = "SSH into the box (uses the private half of the deploy keypair)"
  value       = "ssh -i <path-to-private-key> ubuntu@${aws_eip.app.public_ip}"
}

output "app_url" {
  value = "http://${aws_eip.app.public_ip}"
}

output "admin_url" {
  value = "http://${aws_eip.app.public_ip}/admin/"
}

output "api_health_url" {
  value = "http://${aws_eip.app.public_ip}/health"
}
