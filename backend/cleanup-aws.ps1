# AWS Resource Cleanup Script
# Run this to clean up all resources created during deployment attempts

Write-Host "AWS Resource Cleanup" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

# Check if AWS CLI is installed
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "AWS CLI not found. Please install it first: https://docs.aws.amazon.com/cli/latest/userguide/install-windows.html" -ForegroundColor Red
    exit 1
}

$region = "ap-south-1"

Write-Host "`nChecking for Elastic IPs..." -ForegroundColor Yellow
$eips = aws ec2 describe-addresses --region $region --query 'Addresses[*].[AllocationId,PublicIp]' --output text 2>$null
if ($eips) {
    Write-Host "Found Elastic IPs:" -ForegroundColor Cyan
    $eips
    Write-Host "`nReleasing Elastic IPs..." -ForegroundColor Yellow
    $eipIds = aws ec2 describe-addresses --region $region --query 'Addresses[*].AllocationId' --output text 2>$null
    foreach ($id in $eipIds -split "`t") {
        if ($id) {
            Write-Host "Releasing $id..."
            aws ec2 release-address --allocation-id $id --region $region 2>$null
        }
    }
} else {
    Write-Host "No Elastic IPs found" -ForegroundColor Green
}

Write-Host "`nChecking for load balancers..." -ForegroundColor Yellow
$lbs = aws elbv2 describe-load-balancers --region $region --query 'LoadBalancers[?contains(LoadBalancerName, `fasttag`) || contains(LoadBalancerName, `awseb`)].[LoadBalancerArn,LoadBalancerName]' --output text 2>$null
if ($lbs) {
    Write-Host "Found Load Balancers:" -ForegroundColor Cyan
    $lbs
    Write-Host "`nDeleting load balancers..." -ForegroundColor Yellow
    $lbArns = aws elbv2 describe-load-balancers --region $region --query 'LoadBalancers[?contains(LoadBalancerName, `fasttag`) || contains(LoadBalancerName, `awseb`)].LoadBalancerArn' --output text 2>$null
    foreach ($arn in $lbArns -split "`t") {
        if ($arn) {
            Write-Host "Deleting $arn..."
            aws elbv2 delete-load-balancer --load-balancer-arn $arn --region $region 2>$null
        }
    }
    Write-Host "Waiting for load balancers to delete..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
} else {
    Write-Host "No load balancers found" -ForegroundColor Green
}

Write-Host "`nChecking for target groups..." -ForegroundColor Yellow
$tgs = aws elbv2 describe-target-groups --region $region --query 'TargetGroups[?contains(TargetGroupName, `fasttag`) || contains(TargetGroupName, `awseb`)].[TargetGroupArn,TargetGroupName]' --output text 2>$null
if ($tgs) {
    Write-Host "Found Target Groups:" -ForegroundColor Cyan
    $tgs
    Write-Host "`nDeleting target groups..." -ForegroundColor Yellow
    $tgArns = aws elbv2 describe-target-groups --region $region --query 'TargetGroups[?contains(TargetGroupName, `fasttag`) || contains(TargetGroupName, `awseb`)].TargetGroupArn' --output text 2>$null
    foreach ($arn in $tgArns -split "`t") {
        if ($arn) {
            Write-Host "Deleting $arn..."
            aws elbv2 delete-target-group --target-group-arn $arn --region $region 2>$null
        }
    }
} else {
    Write-Host "No target groups found" -ForegroundColor Green
}

Write-Host "`nChecking for security groups..." -ForegroundColor Yellow
# Get all security groups created by EB
$sgs = aws ec2 describe-security-groups --region $region --query "SecurityGroups[?contains(GroupName, 'fasttag') || contains(GroupName, 'awseb')].[GroupId,GroupName]" --output text 2>$null
if ($sgs) {
    Write-Host "Found Security Groups:" -ForegroundColor Cyan
    $sgs
    Write-Host "`nNote: Some security groups may be in use by other resources and cannot be deleted yet." -ForegroundColor Yellow
} else {
    Write-Host "No EB-related security groups found" -ForegroundColor Green
}

Write-Host "`nChecking for S3 buckets..." -ForegroundColor Yellow
$buckets = aws s3api list-buckets --query 'Buckets[?contains(Name, `elasticbeanstalk`) || contains(Name, `fasttag`)].Name' --output text 2>$null
if ($buckets) {
    Write-Host "Found S3 Buckets:" -ForegroundColor Cyan
    $buckets
    Write-Host "`nNote: These buckets contain deployment artifacts. You can delete them if no longer needed." -ForegroundColor Yellow
    Write-Host "To delete a bucket and its contents, run: aws s3 rb s3://BUCKET_NAME --force" -ForegroundColor Cyan
} else {
    Write-Host "No relevant S3 buckets found" -ForegroundColor Green
}

Write-Host "`nChecking for Auto Scaling Groups..." -ForegroundColor Yellow
$asgs = aws autoscaling describe-auto-scaling-groups --region $region --query "AutoScalingGroups[?contains(AutoScalingGroupName, 'fasttag') || contains(AutoScalingGroupName, 'awseb')].[AutoScalingGroupName,AutoScalingGroupARN]" --output text 2>$null
if ($asgs) {
    Write-Host "Found Auto Scaling Groups:" -ForegroundColor Cyan
    $asgs
} else {
    Write-Host "No Auto Scaling Groups found" -ForegroundColor Green
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Cleanup check complete!" -ForegroundColor Green
Write-Host "`nNote: Some resources may still be deleting (load balancers take ~30 seconds)" -ForegroundColor Yellow
Write-Host "Run this script again in 1-2 minutes to verify all resources are cleaned up." -ForegroundColor Yellow
Write-Host "`nTo check EB environments: eb list" -ForegroundColor Cyan
Write-Host "To terminate any remaining envs: eb terminate ENVIRONMENT_NAME --force" -ForegroundColor Cyan
