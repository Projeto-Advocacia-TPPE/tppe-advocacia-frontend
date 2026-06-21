import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.select import Select

from conftest import BASE_URL

USUARIOS_URL = f"{BASE_URL}/sistema/usuarios"


class TestGerenciarUsuarios:
    """US-03 — Cadastrar, editar, listar e desativar usuários"""

    def test_pagina_usuarios_carrega(self, logged_in, wait):
        logged_in.get(USUARIOS_URL)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Gerenciar Usuários')]")
        ))
        assert "Gerenciar Usuários" in logged_in.page_source

    def test_tabela_usuarios_visivel(self, logged_in, wait):
        logged_in.get(USUARIOS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))

        tabela = logged_in.find_element(By.CSS_SELECTOR, "table")
        assert tabela.is_displayed()
        assert "Nome" in logged_in.page_source
        assert "E-mail" in logged_in.page_source
        assert "Papel" in logged_in.page_source
        assert "Status" in logged_in.page_source

    def test_botao_novo_usuario_abre_modal(self, logged_in, wait):
        logged_in.get(USUARIOS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Novo Usuário')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(., 'Novo Usuário')]").click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Novo Usuário')]")
        ))
        assert logged_in.find_element(By.CSS_SELECTOR, "input[placeholder='Ex: Ana Lima']").is_displayed()
        assert logged_in.find_element(By.CSS_SELECTOR, "input[placeholder='exemplo@escritorio.com']").is_displayed()

    def test_criar_usuario_com_sucesso(self, logged_in, wait):
        email_unico = f"teste.selenium.{int(time.time())}@advocacia.com"

        logged_in.get(USUARIOS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Novo Usuário')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(., 'Novo Usuário')]").click()

        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder='Ex: Ana Lima']")
        ))
        logged_in.find_element(By.CSS_SELECTOR, "input[placeholder='Ex: Ana Lima']").send_keys("Usuário Selenium")
        logged_in.find_element(By.CSS_SELECTOR, "input[placeholder='exemplo@escritorio.com']").send_keys(email_unico)

        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Salvar')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(., 'Salvar')]").click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, f"//*[contains(text(),'{email_unico}')]")
        ))
        assert email_unico in logged_in.page_source

    def test_modal_novo_usuario_cancela(self, logged_in, wait):
        logged_in.get(USUARIOS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Novo Usuário')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(., 'Novo Usuário')]").click()

        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Cancelar')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()

        wait.until(EC.invisibility_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder='Ex: Ana Lima']")
        ))

    def test_visualizar_usuario_abre_modal(self, logged_in, wait):
        logged_in.get(USUARIOS_URL)
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "button[title='Visualizar']")
        ))
        logged_in.find_element(By.CSS_SELECTOR, "button[title='Visualizar']").click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Visualizar Usuário')]")
        ))
        assert "Visualizar Usuário" in logged_in.page_source

        logged_in.find_element(By.CSS_SELECTOR, "button[aria-label='Fechar']").click()

    def test_editar_usuario_abre_modal(self, logged_in, wait):
        logged_in.get(USUARIOS_URL)
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "button[title='Editar']")
        ))
        logged_in.find_element(By.CSS_SELECTOR, "button[title='Editar']").click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Editar Usuário')]")
        ))
        assert "Editar Usuário" in logged_in.page_source
        assert logged_in.find_element(By.CSS_SELECTOR, "input[placeholder='Ex: Ana Lima']").is_displayed()

        logged_in.find_element(By.CSS_SELECTOR, "button[aria-label='Fechar']").click()

    def test_desativar_usuario_abre_confirmacao(self, logged_in, wait):
        logged_in.get(USUARIOS_URL)
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "button[title='Desativar']")
        ))
        logged_in.find_element(By.CSS_SELECTOR, "button[title='Desativar']").click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Desativar Usuário')]")
        ))
        assert "perderá acesso ao sistema" in logged_in.page_source

        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()
        wait.until(EC.invisibility_of_element_located(
            (By.XPATH, "//*[contains(text(),'Desativar Usuário')]")
        ))


class TestRegistrosAuditoria:
    """US-04 — Rastreabilidade de operações sobre usuários"""

    def test_aba_registros_abre(self, logged_in, wait):
        logged_in.get(USUARIOS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Registros')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Registros')]").click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Registros')]")
        ))
        assert "Registros" in logged_in.page_source

    def test_registros_exibem_acoes_de_usuario(self, logged_in, wait):
        logged_in.get(USUARIOS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Registros')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Registros')]").click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Registros')]")
        ))
        assert "Criação de Usuário" in logged_in.page_source or "Nenhum registro encontrado" in logged_in.page_source

    def test_filtro_acao_funciona(self, logged_in, wait):
        logged_in.get(USUARIOS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Registros')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Registros')]").click()

        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "select")))
        Select(logged_in.find_element(By.CSS_SELECTOR, "select")).select_by_visible_text("Criação de Usuário")

        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Registros')]")
        ))
        assert logged_in.find_element(By.CSS_SELECTOR, "select").is_displayed()

    def test_voltar_aos_usuarios_da_aba_registros(self, logged_in, wait):
        logged_in.get(USUARIOS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Registros')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Registros')]").click()

        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Voltar aos Usuários')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(., 'Voltar aos Usuários')]").click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Gerenciar Usuários')]")
        ))
        assert "Gerenciar Usuários" in logged_in.page_source
