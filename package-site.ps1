$ErrorActionPreference = 'Stop'
$artifactDirectory = Join-Path $PSScriptRoot 'artifacts'
New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
$publicFiles = @('.htaccess', 'analytics.js', 'contact.js', 'contact.php', 'privacy.html', 'robots.txt', 'sitemap.xml', 'site.css', 'site.js', 'favicon.svg', 'studio.html', 'capabilities.html', 'process.html', 'explorations.html', 'contact.html', 'index.html') | ForEach-Object { Join-Path $PSScriptRoot $_ }
Compress-Archive -LiteralPath $publicFiles -DestinationPath (Join-Path $artifactDirectory 'robodev-siteground.zip') -Force
Write-Output (Join-Path $artifactDirectory 'robodev-siteground.zip')
