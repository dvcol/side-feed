import type { FeedlyProfile } from '@dvcol/feedly-http-client/models';

let authenticated = $state(false);
let profile = $state<FeedlyProfile | undefined>();

export class AuthStore {
  static get authenticated() {
    return authenticated;
  }

  static set authenticated(value: boolean) {
    authenticated = value;
  }

  static get profile() {
    return profile;
  }

  static set profile(value: FeedlyProfile | undefined) {
    profile = value;
  }
}
