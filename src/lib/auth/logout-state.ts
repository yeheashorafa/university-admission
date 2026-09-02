let isLoggingOut = false;

export function setLogoutInProgress(value: boolean) {
  isLoggingOut = value;
}

export function getLogoutInProgress() {
  return isLoggingOut;
}
