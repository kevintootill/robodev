$ErrorActionPreference = 'Stop'
$artifactDirectory = Join-Path $PSScriptRoot 'artifacts'
New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
$publicFiles = @('index.html', '.htaccess', 'analytics.js', 'contact.js', 'contact.php', 'privacy.html', 'robots.txt', 'sitemap.xml') | ForEach-Object { Join-Path $PSScriptRoot $_ }
Compress-Archive -LiteralPath $publicFiles -DestinationPath (Join-Path $artifactDirectory 'robodev-siteground.zip') -Force
Write-Output (Join-Path $artifactDirectory 'robodev-siteground.zip')
