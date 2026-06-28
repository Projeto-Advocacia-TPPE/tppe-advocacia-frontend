import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from conftest import BASE_URL, TEST_EMAIL, TEST_PASSWORD, pause


class TestLogin:
    """US-01 — Login com e-mail e senha"""

    def test_pagina_login_carrega(self, driver, wait):
        driver.get(f"{BASE_URL}/login")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        pause()

        assert driver.find_element(By.CSS_SELECTOR, "input[type='email']").is_displayed()
        assert driver.find_element(By.CSS_SELECTOR, "input[type='password']").is_displayed()
        assert driver.find_element(By.CSS_SELECTOR, "button[type='submit']").is_displayed()

    def test_botao_desabilitado_sem_preenchimento(self, driver, wait):
        driver.get(f"{BASE_URL}/login")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "button[type='submit']")))
        pause()

        btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        assert not btn.is_enabled()

    def test_login_credenciais_invalidas(self, driver, wait):
        driver.get(f"{BASE_URL}/login")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        pause()

        driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys("invalido@email.com")
        pause()
        driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys("senhaerrada")
        pause()
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'incorretos')]")))
        pause()
        assert "incorretos" in driver.page_source

    def test_login_credenciais_validas(self, driver, wait):
        driver.get(f"{BASE_URL}/login")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        pause()

        driver.find_element(By.CSS_SELECTOR, "input[type='email']").clear()
        driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys(TEST_EMAIL)
        pause()
        driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys(TEST_PASSWORD)
        pause()
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        wait.until(EC.url_contains("/sistema"))
        pause()
        assert "/sistema" in driver.current_url

    def test_acesso_sem_login_redireciona_para_login(self, driver, wait):
        driver.execute_script("localStorage.removeItem('advocacia_access_token')")
        driver.get(f"{BASE_URL}/sistema/processos")

        wait.until(EC.url_contains("/login"))
        pause()
        assert "/login" in driver.current_url


class TestEsqueciSenha:
    """US-02 — Redefinição de senha por e-mail"""

    def test_link_esqueci_senha_abre_tela(self, driver, wait):
        driver.get(f"{BASE_URL}/login")
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Esqueci')]")))
        pause()

        driver.find_element(By.XPATH, "//button[contains(text(),'Esqueci')]").click()

        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Esqueci minha senha')]")))
        pause()
        assert "Esqueci minha senha" in driver.page_source

    def test_voltar_ao_login_da_tela_esqueci(self, driver, wait):
        driver.get(f"{BASE_URL}/login")
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Esqueci')]")))
        pause()
        driver.find_element(By.XPATH, "//button[contains(text(),'Esqueci')]").click()

        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Voltar')]")))
        pause()
        driver.find_element(By.XPATH, "//button[contains(text(),'Voltar')]").click()

        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "button[type='submit']")))
        pause()
        assert driver.find_element(By.CSS_SELECTOR, "button[type='submit']").is_displayed()

    def test_botao_enviar_desabilitado_sem_email(self, driver, wait):
        driver.get(f"{BASE_URL}/login")
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Esqueci')]")))
        pause()
        driver.find_element(By.XPATH, "//button[contains(text(),'Esqueci')]").click()

        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "button[type='submit']")))
        pause()
        btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        assert not btn.is_enabled()

    def test_submeter_email_exibe_confirmacao(self, driver, wait):
        driver.get(f"{BASE_URL}/login")
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Esqueci')]")))
        pause()
        driver.find_element(By.XPATH, "//button[contains(text(),'Esqueci')]").click()

        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        pause()
        driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys("qualquer@email.com")
        pause()
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Verifique seu e-mail')]")))
        pause()
        assert "Verifique seu e-mail" in driver.page_source
