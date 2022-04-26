import { activateLicense, _checkLicense, _reset } from '../src/license/license';

describe("checkLicense", () => {

  beforeEach(() => {
    _reset();
  })

  it('should on success log when the license checks out for a limited amount of developers', () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    
    activateLicense("fake-10");
    
    _checkLicense();

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("uiloos > license > license activated, this license is for use with 10 developers. We thank you for your support, you can disable this message if you want to. If you are not the owner of this website please ignore this message.");
  });

  it('should on success log when the license checks out for a unlimited developers', () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    
    activateLicense("fake-unlimited");
    
    _checkLicense();

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("uiloos > license > license activated, this license is for use with unlimited developers. We thank you for your support, you can disable this message if you want to. If you are not the owner of this website please ignore this message.");
  });

  it('should not check the license once it has already been checked', () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    
    activateLicense("fake-unlimited");
    
    // First time will set _success to true
    _checkLicense();

    // This one will now skip the routine, and exit early.
    _checkLicense();

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("uiloos > license > license activated, this license is for use with unlimited developers. We thank you for your support, you can disable this message if you want to. If you are not the owner of this website please ignore this message.");
  });

  it('should be able to suppress the license activated message', () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    
    activateLicense("fake-10", { logLicenseActivated: false });
    
    _checkLicense();

    expect(console.log).toHaveBeenCalledTimes(0);
  });

  it('should when the license is invalid warn the developer', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    
    activateLicense("invalid",);
    
    _checkLicense();

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith("uiloos > license > invalid license key detected: invalid, please purchase a license at https://www.uiloos.dev. If you are not the owner of this website please ignore this message.");
  });

  it('should when there is no license warn the developer that he must purchase a license', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    
    activateLicense("");
    
    _checkLicense();

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith("uiloos > license > you are using commercial software, please purchase a license at https://www.uiloos.dev. If you are not the owner of this website please ignore this message.");
  });
});