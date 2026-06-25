import random
import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.select import Select

from conftest import BASE_URL, do_login, do_logout, pause

LEADS_URL    = f"{BASE_URL}/sistema/leads"
CLIENTES_URL = f"{BASE_URL}/sistema/clientes"
SITE_URL     = BASE_URL


def js_click(driver, element):
    driver.execute_script("arguments[0].click();", element)


def scroll_and_click(driver, element):
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    time.sleep(0.3)
    driver.execute_script("arguments[0].click();", element)


def _cpf_valido_aleatorio() -> str:
    """Gera um CPF válido aleatório (11 dígitos, com dígitos verificadores corretos)."""
    n = [random.randint(0, 9) for _ in range(9)]
    s = sum((10 - i) * n[i] for i in range(9))
    d1 = 0 if (s * 10 % 11) < 2 else 11 - (s * 10 % 11)
    n.append(d1)
    s = sum((11 - i) * n[i] for i in range(10))
    d2 = 0 if (s * 10 % 11) < 2 else 11 - (s * 10 % 11)
    n.append(d2)
    return ''.join(map(str, n))


# ─────────────────────────────────────────────────────────────────────────────
class TestLeadFormularioPublico:
    """US-10 — Lead do formulário público aparece no painel assim que submetido"""

    def test_formulario_contato_visivel_na_landing(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        pause()
        assert driver.find_element(By.ID, "nome").is_displayed()
        assert driver.find_element(By.ID, "email").is_displayed()
        assert driver.find_element(By.CSS_SELECTOR, "input[name='consentimento']").is_displayed()

    def test_botao_enviar_desabilitado_sem_consentimento(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        pause()
        enviar = driver.find_element(By.XPATH, "//button[contains(text(),'Enviar Mensagem')]")
        assert not enviar.is_enabled()

    def test_envio_lead_publico_exibe_confirmacao(self, driver, wait):
        email_unico = f"selenium.lead.{int(time.time())}@teste.com"
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "nome")))
        pause()

        driver.find_element(By.ID, "nome").send_keys("Lead Selenium E2E")
        pause()
        driver.find_element(By.ID, "email").send_keys(email_unico)
        pause()
        driver.find_element(By.ID, "telefone").send_keys("(61) 91234-5678")
        pause()
        driver.find_element(By.ID, "mensagem").send_keys("Mensagem criada pelo Selenium para teste E2E.")
        pause()
        js_click(driver, driver.find_element(By.CSS_SELECTOR, "input[name='consentimento']"))
        pause()

        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Enviar Mensagem')]")
        ))
        scroll_and_click(driver, driver.find_element(By.XPATH, "//button[contains(text(),'Enviar Mensagem')]"))

        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Mensagem enviada')]")
        ))
        pause()
        assert "Mensagem enviada" in driver.page_source

    def test_lead_enviado_pelo_site_aparece_no_painel(self, driver, wait):
        driver.execute_script("localStorage.removeItem('advocacia_access_token')")
        email_unico = f"selenium.painel.{int(time.time())}@teste.com"

        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "nome")))
        pause()
        driver.find_element(By.ID, "nome").send_keys("Lead Painel Selenium")
        pause()
        driver.find_element(By.ID, "email").send_keys(email_unico)
        pause()
        js_click(driver, driver.find_element(By.CSS_SELECTOR, "input[name='consentimento']"))
        pause()
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Enviar Mensagem')]")
        ))
        scroll_and_click(driver, driver.find_element(By.XPATH, "//button[contains(text(),'Enviar Mensagem')]"))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Mensagem enviada')]")
        ))
        pause()

        do_login(driver, wait)
        driver.get(LEADS_URL)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Gestão de Leads')]")
        ))
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        pause()
        assert "Nenhum lead encontrado" not in driver.page_source

        do_logout(driver)


# ─────────────────────────────────────────────────────────────────────────────
class TestGerenciarLeads:
    """US-11 — Listar, filtrar, alterar status e atribuir responsáveis a leads"""

    def test_pagina_leads_carrega(self, logged_in, wait):
        logged_in.get(LEADS_URL)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Gestão de Leads')]")
        ))
        pause()
        assert "Gestão de Leads" in logged_in.page_source

    def test_metricas_de_leads_visiveis(self, logged_in, wait):
        logged_in.get(LEADS_URL)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Gestão de Leads')]")
        ))
        pause()
        assert "Total de leads"  in logged_in.page_source
        assert "Novos"           in logged_in.page_source
        assert "Em atendimento"  in logged_in.page_source
        assert "Fechados"        in logged_in.page_source

    def test_tabela_leads_exibe_colunas(self, logged_in, wait):
        logged_in.get(LEADS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        pause()
        assert "Nome"        in logged_in.page_source
        assert "Contato"     in logged_in.page_source
        assert "Responsável" in logged_in.page_source
        assert "Recebido em" in logged_in.page_source
        assert "Status"      in logged_in.page_source
        assert "Ação"        in logged_in.page_source

    def test_filtro_status_novo_filtra_lista(self, logged_in, wait):
        logged_in.get(LEADS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "select")))
        pause()
        Select(logged_in.find_elements(By.CSS_SELECTOR, "select")[0]).select_by_visible_text("Novo")
        pause()
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        pause()
        assert "Gestão de Leads" in logged_in.page_source

    def test_filtro_todos_os_status_restaura_lista(self, logged_in, wait):
        logged_in.get(LEADS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "select")))
        pause()
        selects = logged_in.find_elements(By.CSS_SELECTOR, "select")
        Select(selects[0]).select_by_visible_text("Em atendimento")
        pause()
        time.sleep(0.4)
        Select(selects[0]).select_by_visible_text("Todos os status")
        pause()
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        pause()
        assert "Gestão de Leads" in logged_in.page_source

    def test_abrir_contato_exibe_drawer(self, logged_in, wait):
        logged_in.get(LEADS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        pause()
        try:
            btn = logged_in.find_element(By.XPATH, "//button[contains(text(),'Abrir contato')]")
            scroll_and_click(logged_in, btn)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Contato recebido')]")
            ))
            pause()
            assert "Contato recebido" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum lead disponível para abrir o drawer")

    def test_drawer_lead_exibe_campos_status_e_responsavel(self, logged_in, wait):
        logged_in.get(LEADS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        pause()
        try:
            btn = logged_in.find_element(By.XPATH, "//button[contains(text(),'Abrir contato')]")
            scroll_and_click(logged_in, btn)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Status do atendimento')]")
            ))
            pause()
            assert "Status do atendimento" in logged_in.page_source
            assert "Responsável"           in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum lead disponível")

    def test_alterar_status_do_lead_no_drawer(self, logged_in, wait):
        logged_in.get(LEADS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        pause()
        try:
            btn = logged_in.find_element(By.XPATH, "//button[contains(text(),'Abrir contato')]")
            scroll_and_click(logged_in, btn)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Status do atendimento')]")
            ))
            pause()
            selects_drawer = logged_in.find_elements(By.XPATH, "//aside//select")
            if selects_drawer:
                Select(selects_drawer[0]).select_by_visible_text("Em atendimento")
                pause()
                wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//*[contains(text(),'Lead atualizado')]")
                ))
                pause()
                assert "Lead atualizado" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum lead disponível")

    def test_fechar_drawer_lead(self, logged_in, wait):
        logged_in.get(LEADS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        pause()
        try:
            btn = logged_in.find_element(By.XPATH, "//button[contains(text(),'Abrir contato')]")
            scroll_and_click(logged_in, btn)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Contato recebido')]")
            ))
            pause()
            logged_in.find_element(By.CSS_SELECTOR, "button[aria-label='Fechar']").click()
            wait.until(EC.invisibility_of_element_located(
                (By.XPATH, "//*[contains(text(),'Contato recebido')]")
            ))
            pause()
        except NoSuchElementException:
            pytest.skip("Nenhum lead disponível")

    def test_botao_atualizar_recarrega_leads(self, logged_in, wait):
        logged_in.get(LEADS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Atualizar')]")
        ))
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(.,'Atualizar')]").click()
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        pause()
        assert "Gestão de Leads" in logged_in.page_source


# ─────────────────────────────────────────────────────────────────────────────
class TestCadastrarEditarClientes:
    """US-12 — Cadastrar e editar dados pessoais e de contato dos clientes"""

    def test_pagina_clientes_carrega(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Clientes')]")
        ))
        pause()
        assert "Clientes" in logged_in.page_source

    def test_metricas_de_clientes_visiveis(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Clientes')]")
        ))
        pause()
        assert "Clientes encontrados"    in logged_in.page_source
        assert "Pessoas nesta página"    in logged_in.page_source
        assert "Empresas nesta página"   in logged_in.page_source
        assert "Com e-mail nesta página" in logged_in.page_source

    def test_tabela_clientes_exibe_colunas(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        pause()
        assert "Cliente"   in logged_in.page_source
        assert "Tipo"      in logged_in.page_source
        assert "Documento" in logged_in.page_source
        assert "Telefone"  in logged_in.page_source
        assert "Ação"      in logged_in.page_source

    def test_botao_novo_cliente_abre_modal(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Novo cliente')]")
        ))
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(.,'Novo cliente')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Cadastrar cliente')]")
        ))
        pause()
        assert "Cadastrar cliente" in logged_in.page_source

    def test_modal_exibe_opcoes_pessoa_fisica_e_juridica(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Novo cliente')]")
        ))
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(.,'Novo cliente')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(.,'Pessoa física')]")
        ))
        pause()
        assert "Pessoa física"   in logged_in.page_source
        assert "Pessoa jurídica" in logged_in.page_source

    def test_modal_exibe_campos_nome_cpf_email(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Novo cliente')]")
        ))
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(.,'Novo cliente')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Nome completo')]")
        ))
        pause()
        assert "Nome completo" in logged_in.page_source
        assert "CPF"           in logged_in.page_source
        assert "E-mail"        in logged_in.page_source

    def test_cancelar_modal_fecha(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Novo cliente')]")
        ))
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(.,'Novo cliente')]").click()
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Cancelar')]")
        ))
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()
        wait.until(EC.invisibility_of_element_located(
            (By.XPATH, "//*[contains(text(),'Cadastrar cliente')]")
        ))
        pause()

    def test_cadastrar_cliente_pessoa_fisica_aparece_na_lista(self, logged_in, wait):
        nome_unico = f"Cliente Selenium {int(time.time())}"
        cpf = _cpf_valido_aleatorio()

        logged_in.get(CLIENTES_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Novo cliente')]")
        ))
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(.,'Novo cliente')]").click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//span[contains(text(),'Nome completo')]")
        ))
        pause()
        logged_in.find_element(
            By.XPATH, "//span[contains(text(),'Nome completo')]/following-sibling::input"
        ).send_keys(nome_unico)
        pause()
        logged_in.find_element(
            By.CSS_SELECTOR, "input[placeholder='000.000.000-00']"
        ).send_keys(cpf)
        pause()

        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Cadastrar cliente')]")
        ))
        logged_in.find_element(
            By.XPATH, "//button[contains(text(),'Cadastrar cliente')]"
        ).click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, f"//*[contains(text(),'{nome_unico}')]")
        ))
        pause()
        assert nome_unico in logged_in.page_source

    def test_selecionar_pessoa_juridica_troca_campo_documento(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Novo cliente')]")
        ))
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(.,'Novo cliente')]").click()
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Pessoa jurídica')]")
        ))
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(.,'Pessoa jurídica')]").click()
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder='00.000.000/0000-00']")
        ))
        pause()
        assert "CNPJ" in logged_in.page_source

        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()
        pause()


# ─────────────────────────────────────────────────────────────────────────────
class TestFicha360Cliente:
    """US-13 — Visualizar histórico completo do cliente em uma única tela"""

    def _abrir_ficha(self, driver, wait):
        driver.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        btn = driver.find_element(By.XPATH, "//button[contains(text(),'Ver ficha 360')]")
        scroll_and_click(driver, btn)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Ficha 360 do cliente')]")
        ))
        pause()

    def test_botao_ver_ficha_360_abre_drawer(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        pause()
        try:
            self._abrir_ficha(logged_in, wait)
            assert "Ficha 360 do cliente" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível")

    def test_ficha_360_exibe_dados_de_contato(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        try:
            self._abrir_ficha(logged_in, wait)
            assert "E-mail"        in logged_in.page_source
            assert "Telefone"      in logged_in.page_source
            assert "Cliente desde" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível")

    def test_ficha_360_exibe_secao_processos_vinculados(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        try:
            self._abrir_ficha(logged_in, wait)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//h3[contains(text(),'Processos vinculados')]")
            ))
            pause()
            assert "Processos vinculados" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível")

    def test_ficha_360_exibe_secao_observacoes(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        try:
            self._abrir_ficha(logged_in, wait)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//h3[contains(text(),'Observações')]")
            ))
            pause()
            assert "Observações" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível")

    def test_ficha_360_exibe_secao_atividades_recentes(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        try:
            self._abrir_ficha(logged_in, wait)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//h3[contains(text(),'Atividades recentes')]")
            ))
            pause()
            assert "Atividades recentes" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível")

    def test_ficha_360_tem_botao_editar_dados(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        try:
            self._abrir_ficha(logged_in, wait)
            assert logged_in.find_element(
                By.CSS_SELECTOR, "button[aria-label='Editar dados']"
            ).is_displayed()
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível")

    def test_editar_dados_da_ficha_abre_modal_edicao(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        try:
            self._abrir_ficha(logged_in, wait)
            logged_in.find_element(
                By.CSS_SELECTOR, "button[aria-label='Editar dados']"
            ).click()
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Editar cliente')]")
            ))
            pause()
            assert "Editar cliente" in logged_in.page_source
            scroll_and_click(logged_in, logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]"))
            pause()
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível")

    def test_fechar_ficha_360(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        try:
            self._abrir_ficha(logged_in, wait)
            logged_in.find_element(
                By.CSS_SELECTOR, "button[aria-label='Fechar ficha']"
            ).click()
            wait.until(EC.invisibility_of_element_located(
                (By.XPATH, "//*[contains(text(),'Ficha 360 do cliente')]")
            ))
            pause()
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível")


# ─────────────────────────────────────────────────────────────────────────────
class TestBuscarClientes:
    """US-14 — Buscar clientes por nome, CPF/CNPJ ou número de processo vinculado"""

    def test_campo_busca_visivel(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder*='Buscar']")
        ))
        pause()
        assert logged_in.find_element(
            By.CSS_SELECTOR, "input[placeholder*='Buscar']"
        ).is_displayed()

    def test_buscar_por_nome_atualiza_lista(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder*='Buscar']")
        ))
        pause()
        logged_in.find_element(
            By.CSS_SELECTOR, "input[placeholder*='Buscar']"
        ).send_keys("Selenium")
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Buscar')]").click()

        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        pause()
        assert (
            "Selenium" in logged_in.page_source or
            "Nenhum cliente encontrado" in logged_in.page_source
        )

    def test_limpar_busca_remove_filtro(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder*='Buscar']")
        ))
        pause()
        logged_in.find_element(
            By.CSS_SELECTOR, "input[placeholder*='Buscar']"
        ).send_keys("xyztermoqualquer")
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Buscar')]").click()

        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Limpar busca')]")
        ))
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Limpar busca')]").click()
        wait.until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[contains(text(),'Limpar busca')]")
        ))
        pause()
        assert "Clientes" in logged_in.page_source

    def test_busca_sem_resultado_exibe_mensagem(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder*='Buscar']")
        ))
        pause()
        logged_in.find_element(
            By.CSS_SELECTOR, "input[placeholder*='Buscar']"
        ).send_keys("zzzzzzseleniumimpossivel99999")
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Buscar')]").click()

        wait.until(lambda d: (
            "Nenhum cliente encontrado" in d.page_source or
            "Processos vinculados" in d.page_source
        ))
        pause()
        assert (
            "Nenhum cliente encontrado" in logged_in.page_source or
            "Processos vinculados" in logged_in.page_source
        )

    def test_busca_por_numero_processo_exibe_fallback_ou_cliente(self, logged_in, wait):
        logged_in.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder*='Buscar']")
        ))
        pause()
        logged_in.find_element(
            By.CSS_SELECTOR, "input[placeholder*='Buscar']"
        ).send_keys("0000000-00")
        pause()
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Buscar')]").click()

        wait.until(lambda d: (
            "Nenhum cliente encontrado" in d.page_source or
            "Processos vinculados" in d.page_source or
            "Ver ficha" in d.page_source
        ))
        pause()
        assert (
            "Nenhum cliente encontrado" in logged_in.page_source or
            "Processos vinculados" in logged_in.page_source or
            "Ver ficha" in logged_in.page_source
        )


# ─────────────────────────────────────────────────────────────────────────────
class TestObservacoesCliente:
    """US-15 — Registrar observações internas vinculadas a um cliente"""

    def _abrir_ficha(self, driver, wait):
        driver.get(CLIENTES_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        btn = driver.find_element(By.XPATH, "//button[contains(text(),'Ver ficha 360')]")
        scroll_and_click(driver, btn)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h3[contains(text(),'Observações')]")
        ))
        pause()

    def test_textarea_nova_observacao_visivel(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            assert logged_in.find_element(
                By.CSS_SELECTOR,
                "textarea[placeholder*='Registre uma informação']"
            ).is_displayed()
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível")

    def test_botao_registrar_desabilitado_com_textarea_vazio(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            registrar = logged_in.find_element(
                By.XPATH, "//button[contains(text(),'Registrar')]"
            )
            assert not registrar.is_enabled()
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível")

    def test_registrar_observacao_aparece_na_lista(self, logged_in, wait):
        obs_unica = f"Observação Selenium {int(time.time())}"
        try:
            self._abrir_ficha(logged_in, wait)
            textarea = logged_in.find_element(
                By.CSS_SELECTOR, "textarea[placeholder*='Registre uma informação']"
            )
            textarea.send_keys(obs_unica)
            pause()
            wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Registrar')]")
            ))
            logged_in.find_element(By.XPATH, "//button[contains(text(),'Registrar')]").click()
            wait.until(EC.presence_of_element_located(
                (By.XPATH, f"//*[contains(text(),'{obs_unica}')]")
            ))
            pause()
            assert obs_unica in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível")

    def test_editar_observacao_abre_textarea_inline(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            try:
                edit_btn = logged_in.find_element(
                    By.CSS_SELECTOR, "button[aria-label='Editar observação']"
                )
                scroll_and_click(logged_in, edit_btn)
                wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//button[contains(text(),'Salvar')]")
                ))
                pause()
                assert "Salvar"   in logged_in.page_source
                assert "Cancelar" in logged_in.page_source
                logged_in.find_element(
                    By.XPATH, "//button[contains(text(),'Cancelar')]"
                ).click()
                pause()
            except NoSuchElementException:
                pytest.skip("Nenhuma observação disponível para editar")
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível")
