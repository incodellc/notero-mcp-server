resource "aws_sns_topic" "mcp_server_alarms" {
  count = var.alarm_notification_email != "" ? 1 : 0
  name  = "notero-mcp-server-alarms"
}

resource "aws_sns_topic_subscription" "mcp_server_alarm_email" {
  count     = var.alarm_notification_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.mcp_server_alarms[0].arn
  protocol  = "email"
  endpoint  = var.alarm_notification_email
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "notero-mcp-server-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = var.cpu_alarm_threshold_percent
  alarm_description   = "MCP server CPU utilization is high"
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = aws_instance.mcp_server.id
  }

  alarm_actions = var.alarm_notification_email != "" ? [aws_sns_topic.mcp_server_alarms[0].arn] : []
}

resource "aws_cloudwatch_metric_alarm" "status_check_failed" {
  alarm_name          = "notero-mcp-server-status-check-failed"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "MCP server EC2 status checks are failing"
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = aws_instance.mcp_server.id
  }

  alarm_actions = var.alarm_notification_email != "" ? [aws_sns_topic.mcp_server_alarms[0].arn] : []
}

resource "aws_cloudwatch_metric_alarm" "disk_high" {
  alarm_name          = "notero-mcp-server-disk-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "disk_used_percent"
  namespace           = "CWAgent"
  period              = 300
  statistic           = "Average"
  threshold           = var.disk_alarm_threshold_percent
  alarm_description   = "MCP server disk utilization is high. Requires the CloudWatch agent on the instance."
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = aws_instance.mcp_server.id
    path       = "/"
    fstype     = "xfs"
  }

  alarm_actions = var.alarm_notification_email != "" ? [aws_sns_topic.mcp_server_alarms[0].arn] : []
}

resource "aws_cloudwatch_metric_alarm" "memory_high" {
  alarm_name          = "notero-mcp-server-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = 300
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "MCP server memory utilization is high. Requires the CloudWatch agent on the instance."
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = aws_instance.mcp_server.id
  }

  alarm_actions = var.alarm_notification_email != "" ? [aws_sns_topic.mcp_server_alarms[0].arn] : []
}
