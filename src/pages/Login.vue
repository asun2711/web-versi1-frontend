<template>
  <div class="login-wrapper">
    <section class="login-section">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin" :disabled="isLocked || (needsCaptcha && !captchaVerified)">
        <div class="form-group" :class="{ 'error-group': usernameError }">
          <input
            id="username"
            type="text"
            v-model.trim="username"
            @input="validateUsername"
            :disabled="isLocked"
            placeholder="Username"
            autocomplete="username"
            required
          />
          <transition name="fade">
            <small v-if="usernameError" class="error-msg">{{ usernameError }}</small>
          </transition>
        </div>

        <div class="form-group password-group" :class="{ 'error-group': passwordError }">
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              @input="validatePassword"
              :disabled="isLocked"
              placeholder="Password"
              autocomplete="current-password"
              minlength="8"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="togglePassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :class="{ active: showPassword }"
              :disabled="isLocked"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94a10 10 0 0 1-13.88-13.88"/>
                <path d="M1 1l22 22"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="12" rx="7" ry="5"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <transition name="fade">
            <small v-if="passwordError" class="error-msg">{{ passwordError }}</small>
          </transition>
        </div>

        <div v-if="needsCaptcha" class="form-group captcha-group">
          <label for="captcha-text">
            Captcha <span class="required">*</span>
          </label>
          <div class="captcha-wrapper">
            <img :src="captchaImageUrl" alt="Captcha" class="captcha-image" />
            <button type="button" class="refresh-captcha" @click="refreshCaptcha" aria-label="Refresh captcha">&#x21bb;</button>
          </div>
          <input
            id="captcha-text"
            v-model="captchaText"
            @input="validateCaptcha"
            :disabled="isLocked"
            autocomplete="off"
            placeholder="Type the text displayed"
            required
          />
          <transition name="fade">
            <small v-if="captchaError" class="error-msg">{{ captchaError }}</small>
          </transition>
        </div>

        <div class="form-group remember-me">
          <input type="checkbox" id="rememberMe" v-model="rememberMe" />
          <label for="rememberMe">Remember Me</label>
        </div>

        <button type="submit" :disabled="isLocked || (needsCaptcha && !captchaVerified)">
          <span v-if="isSubmitting" class="loading-spinner"></span>
          <span v-if="isSubmitting">Logging in...</span>
          <span v-else>Log In</span>
        </button>

        <transition name="fade">
          <p v-if="errorMessage && !isLocked" class="error-msg form-error" role="alert">{{ errorMessage }}</p>
        </transition>

        <transition name="fade">
          <p v-if="isLocked" class="lock-message" role="alert">
            Terlalu banyak percobaan. Silakan Tunggu <strong>{{ formattedLockTime }}</strong>.
          </p>
        </transition>
      </form>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Login',
  setup() {
    const username = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const rememberMe = ref(false);
    const usernameError = ref('');
    const passwordError = ref('');
    const captchaError = ref('');
    const errorMessage = ref('');
    const isSubmitting = ref(false);
    const isLocked = ref(false);
    const needsCaptcha = ref(false);

    const captchaText = ref('');
    const captchaVerified = ref(false);
    const captchaImageUrl = ref('');

    const lockDuration = 300; // 5 minutes lock time
    const lockTimeLeft = ref(lockDuration);
    let lockTimer: number | undefined;

    const TOKEN_EXPIRATION_HOURS = 5;

    const formattedLockTime = computed(() => {
      const minutes = Math.floor(lockTimeLeft.value / 60);
      const seconds = lockTimeLeft.value % 60;
      return `${minutes} menit ${seconds.toString().padStart(2, '0')} detik`;
    });

    const router = useRouter();
    const failedAttempts = ref(0);
    let currentCaptcha = '';

    const validateUsername = () => {
      usernameError.value = username.value.trim() ? '' : 'Please enter username/email';
      return !usernameError.value;
    };

    const validatePassword = () => {
      if (!password.value) passwordError.value = 'Password is required';
      else if (password.value.length < 8) passwordError.value = 'Minimum 8 characters';
      else passwordError.value = '';
      return !passwordError.value;
    };

    const validateCaptcha = () => {
      if (!captchaText.value) {
        captchaError.value = '';
        captchaVerified.value = false;
        return false;
      }
      if (captchaText.value.toUpperCase() === currentCaptcha) {
        captchaVerified.value = true;
        captchaError.value = '';
        return true;
      } else {
        captchaVerified.value = false;
        captchaError.value = 'Not suitable';
        return false;
      }
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const generateCaptcha = (): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let captcha = '';
      for (let i = 0; i < 5; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '32px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(captcha, 10, 30);
      }
      captchaImageUrl.value = canvas.toDataURL();
      return captcha;
    };

    const refreshCaptcha = () => {
      currentCaptcha = generateCaptcha().toUpperCase();
      captchaVerified.value = false;
      captchaText.value = '';
      captchaError.value = '';
    };

    const startLockTimer = () => {
      isLocked.value = true;
      lockTimeLeft.value = lockDuration;
      lockTimer = window.setInterval(() => {
        if (lockTimeLeft.value > 0) lockTimeLeft.value--;
        else {
          isLocked.value = false;
          failedAttempts.value = 0;
          errorMessage.value = '';
          needsCaptcha.value = true;
          captchaVerified.value = false;
          refreshCaptcha();
          clearInterval(lockTimer);
        }
      }, 1000);
    };

    const handleLogin = async () => {
      errorMessage.value = '';
      if (!validateUsername() || !validatePassword()) return;
      if (isLocked.value) return;
      if (needsCaptcha.value && !validateCaptcha()) return;

      isSubmitting.value = true;
      try {
        await new Promise(res => setTimeout(res, 1500));

        if (
          username.value.toLowerCase() === 'admin' &&
          password.value === 'KakakAsun' &&
          (!needsCaptcha.value || captchaVerified.value)
        ) {
          const now = Date.now();
          const expirationTimestamp = now + TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000;
          localStorage.setItem('auth_token', 'dummy-token');
          localStorage.setItem('token_expiration', expirationTimestamp.toString());

          if (rememberMe.value) {
            localStorage.setItem('remember_me', 'true');
            localStorage.setItem('login_time', now.toString());
          } else {
            localStorage.removeItem('remember_me');
            localStorage.removeItem('login_time');
          }

          failedAttempts.value = 0;
          captchaVerified.value = false;
          needsCaptcha.value = false;
          captchaText.value = '';
          errorMessage.value = '';
          router.push('/admin');
        } else {
          failedAttempts.value++;
          errorMessage.value = 'Invalid username or password';
          if (failedAttempts.value === 3) startLockTimer();
        }
      } catch {
        errorMessage.value = 'Server error, please try again later.';
      } finally {
        isSubmitting.value = false;
      }
    };

    if (needsCaptcha.value) refreshCaptcha();

    return {
      username, password, showPassword, rememberMe,
      usernameError, passwordError, captchaError, errorMessage,
      isSubmitting, isLocked, needsCaptcha, captchaVerified,
      captchaText, captchaImageUrl, formattedLockTime,
      togglePassword, refreshCaptcha, handleLogin,
      validateUsername, validatePassword, validateCaptcha,
    };
  },
});
</script>

<style scoped>
.login-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center; /* horizontal center */
  align-items: center; /* vertical center */
  background-color: #f5f7fa; /* optional background */
}
.login-section {
  max-width: 380px;
  width: 100%;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 0 10px #ddd;
  background-color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0; /* important to avoid margin offset */
}

/* berikut gaya input dan styling lain sama seperti sebelumnya */
.form-group,
.password-group,
.captcha-group {
  margin-bottom: 1.3rem;
  position: relative;
}
input[type='text'],
input[type='password'] {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1.5px solid #b0c4de;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}
input:focus {
  border-color: #1e90ff;
  outline: none;
}
.error-msg {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  transition: opacity 0.3s ease;
}
.error-group input {
  border-color: #e74c3c;
  background-color: #fff0f0;
}
.password-group input {
  padding-right: 3.5rem;
}
.toggle-password {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: none;
  color: #3498db;
  cursor: pointer;
  user-select: none;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
}
.toggle-password:hover,
.toggle-password.active {
  color: #104e8b;
}
.captcha-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 0.4rem;
}
.captcha-image {
  width: 120px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 7px;
  user-select: none;
}
.refresh-captcha {
  margin-left: 0.5rem;
  padding: 4px 10px;
  background-color: #eeeeee;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 6px;
  transition: background-color 0.25s ease;
}
.refresh-captcha:hover {
  background-color: #cccccc;
}
button[type='submit'] {
  width: 100%;
  padding: 0.75rem;
  background-color: #1e90ff;
  border: none;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 7px;
  transition: background-color 0.25s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}
button[type='submit']:hover:not(:disabled) {
  background-color: #104e8b;
}
button[type='submit']:disabled {
  background-color: #a0cdfc;
  cursor: not-allowed;
}
.form-error,
.lock-message {
  margin-top: 1.1rem;
  color: #e74c3c;
  text-align: center;
  font-weight: 600;
  font-size: 1.05rem;
}
.lock-message strong {
  color: #1e90ff;
}
.remember-me {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.remember-me label {
  margin-left: 0.4rem;
  font-weight: 500;
  color: #333;
}
.required {
  color: #e74c3c;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.loading-spinner {
  border: 2px solid transparent;
  border-top: 2px solid #fff;
  border-right: 2px solid #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  animation: spin 0.75s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
