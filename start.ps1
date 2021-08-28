param (
  [Boolean] $close = $false
)

Write-Host $PS1
$Service = Get-Service postgresql-x64-13

if ($close.Equals($false))
{
  if ($Service.Status.Equals("Running")) {
    Write-Output "Service already running."
    return
  }

  Start-Process -FilePath "powershell" -Verb RunAs -ArgumentList "/c Start-Service postgresql-x64-13"
} else {
  if ($Service.Status.Equals("Stopped")) {
    Write-Output "Service already stopped."
    return
  }

  Start-Process -FilePath "powershell" -Verb RunAs -ArgumentList "/c Stop-Service postgresql-x64-13"
}
