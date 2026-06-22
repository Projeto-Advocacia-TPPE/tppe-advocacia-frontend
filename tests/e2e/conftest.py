import os
import time
import pytest
from selenium import webdriver
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.microsoft import EdgeChromiumDriverManager

SLOW = float(os.getenv("SLOW", "0"))

BASE_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
TEST_EMAIL = os.getenv("TEST_EMAIL", "admin@advocacia.com")
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "senha123")


@pytest.fixture(scope="session")
def driver():
    options = Options()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,900")

    service = Service(EdgeChromiumDriverManager().install())
    browser = webdriver.Edge(service=service, options=options)
    browser.implicitly_wait(5)

    yield browser

    browser.quit()


@pytest.fixture
def wait(driver):
    return WebDriverWait(driver, 10)


def pause():
    if SLOW:
        time.sleep(SLOW)


def do_login(driver, wait):
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


def do_logout(driver):
    driver.execute_script("localStorage.removeItem('advocacia_access_token')")
    driver.get(f"{BASE_URL}/login")


@pytest.fixture
def logged_in(driver, wait):
    do_login(driver, wait)
    yield driver
    do_logout(driver)
