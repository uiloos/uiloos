class LicenseChecker {
  private _licenseKey: string = '';

  private _logOnSuccess: boolean = false;

  private _success: boolean = false;

  /**
   * With `activateLicense` you can set activate your license key for
   * uiloos. Make sure that you set your license key before using any
   * functionality that uiloos provides.
   *
   * You can purchase a license at https://www.uiloos.dev.
   *
   * @param {string} licenseKey The license key of uiloos you want to activate.
   * @param {ActivateLicenseOptions} options The optional options for the `activateLicense` function, can be used to suppress the "license activated" message.
   */
  public activateLicense(
    licenseKey: string,
    options: ActivateLicenseOptions = { logLicenseActivated: true }
  ): void {
    this._licenseKey = licenseKey;
    this._logOnSuccess = options.logLicenseActivated;
  }

  /**
   * Checks the current license to see if it is valid.
   * 
   * Note: this method is for internal use inside uiloos only.
   */
  public _checkLicense(): void {
    // This prevents needless checking when the license has already,
    // been successfully checked.
    if (this._success) {
      return;
    }

    if (this._licenseKey) {
      const parts = this._licenseKey.split('-');

      if (parts.length !== 2) {
        console.warn(
          `uiloos > license > invalid license key detected: ${this._licenseKey}, ${buy}`
        );
      } else {
        const [_, type] = parts;

        if (this._logOnSuccess) {
          console.log(
            `uiloos > license > license activated, this license is for use with ${type} developers. We thank you for your support, you can disable this message if you want to. ${owner}`
          );
        }

        this._success = true;
      }
    } else {
      console.warn(
        `uiloos > license > you are using commercial software, ${buy}`
      );
    }
  }
}

export let licenseChecker = new LicenseChecker();

/**
 * The options for the `activateLicense` functions. Can be used
 * to silence the "license activated" message.
 */
export type ActivateLicenseOptions = {
  /**
   * Whether or not to silence the "license activated" message
   * when the license is valid.
   */
  logLicenseActivated: boolean;
};

const owner =
  'If you are not the owner of this website please ignore this message.';

const buy = `please purchase a license at https://www.uiloos.dev. ${owner}`;

// unit testing purposes onloy
export function _reset() {
  licenseChecker = new LicenseChecker();
}
