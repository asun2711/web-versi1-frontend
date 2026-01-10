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
            required/>
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
              required/>
            <button
              type="button"
              class="toggle-password"
              @click="togglePassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :class="{ active: showPassword }"
              :disabled="isLocked">
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
            required/>
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

    const lockDuration = 300;
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
        const randomIndex = Math.floor(Math.random() * chars.length);
        const char = chars.charAt(randomIndex);
        captcha += char;
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
          password.value === '@$un1234' &&
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
  min-height: 95vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-wrapper::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: float 20s linear infinite;
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(100px, 100px) rotate(360deg); }
}

.login-section {
  max-width: 380px;
  width: 100%;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-section h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-group,
.password-group,
.captcha-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

input[type='text'],
input[type='password'] {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 0.95rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: #f8fafc;
  color: #1e293b;
  outline: none;
}

input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-msg {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.error-group input {
  border-color: #dc2626;
  background: #fef2f2;
}

.password-group input {
  padding-right: 3.5rem;
}

.password-input-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: #94a3b8;
  cursor: pointer;
  user-select: none;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.toggle-password:hover,
.toggle-password.active {
  color: #667eea;
}

.captcha-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 7px;
  user-select: none;
  flex: 1;
}

.refresh-captcha {
  padding: 0.5rem;
  background-color: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-captcha:hover {
  background-color: #667eea;
  border-color: #667eea;
  color: white;
}

button[type='submit'] {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

button[type='submit']::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

button[type='submit']:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

button[type='submit']:hover:not(:disabled)::before {
  left: 100%;
}

button[type='submit']:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.form-error,
.lock-message {
  margin-top: 1.1rem;
  color: #dc2626;
  text-align: center;
  font-weight: 600;
  font-size: 1.05rem;
  padding: 1rem;
  border-radius: 10px;
  background: #fef2f2;
  border: 2px solid #fecaca;
}

.lock-message {
  background: #fffbeb;
  border: 2px solid #fde68a;
  color: #d97706;
}

.lock-message strong {
  color: #667eea;
}

.remember-me {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me label {
  margin-left: 0.4rem;
  font-weight: 500;
  color: #475569;
  font-size: 0.9rem;
}

.required {
  color: #dc2626;
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

.alert {
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (max-width: 480px) {
  .login-section {
    padding: 2rem 1.5rem;
  }
  
  .login-section h2 {
    font-size: 1.75rem;
  }
  
  .captcha-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .refresh-captcha {
    width: 100%;
    padding: 0.75rem;
  }
}

@media (prefers-color-scheme: dark) {
  .login-section {
    background: #1e293b;
    border-color: #334155;
  }
  
  .login-section h2 {
    color: #f1f5f9;
  }
  
  input[type='text'],
  input[type='password'] {
    background: #334155;
    border-color: #475569;
    color: #f1f5f9;
  }
  
  input:focus {
    background: #1e293b;
  }
  
  .remember-me label {
    color: #cbd5e1;
  }
}
</style>