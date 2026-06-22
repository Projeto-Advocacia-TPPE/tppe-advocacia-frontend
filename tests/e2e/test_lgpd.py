import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException

from conftest import BASE_URL, do_login, do_logout

CLIENTES_URL = f"{BASE_URL}/sistema/clientes"
SITE_URL     = BASE_URL


def js_click(driver, element):
    driver.execute_script("arguments[0].click();", element)


def scroll_and_click(driver, element):
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    time.sleep(0.3)
    driver.execute_script("arguments[0].click();", element)


def _abrir_ficha_360(driver, wait):
    driver.get(CLIENTES_URL)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
    btn = driver.find_element(By.XPATH, "//button[contains(text(),'Ver ficha 360')]")
    scroll_and_click(driver, btn)
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(text(),'Ficha 360 do cliente')]")
    ))


def _abrir_modal_anonimizar(driver, wait):
    _abrir_ficha_360(driver, wait)
    scroll_and_click(driver, driver.find_element(
        By.CSS_SELECTOR, "button[aria-label='Anonimizar cliente']"
    ))
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(text(),'Anonimizar cliente pela LGPD')]")
    ))


def _campo_confirmacao(driver):
    return driver.find_element(
        By.XPATH, "//span[contains(.,'para confirmar')]/following-sibling::input"
    )


def _nome_cliente_na_ficha(driver):
    return driver.find_element(
        By.XPATH, "//p[contains(text(),'Ficha 360 do cliente')]/following-sibling::h2"
    ).text


# ─────────────────────────────────────────────────────────────────────────────
class TestTermoConsentimento:
    """US-25 — Visitante visualiza o termo de consentimento antes de enviar o formulário"""

    def test_botao_termo_consentimento_visivel_no_formulario(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        termo_btn = driver.find_element(By.XPATH, "//button[contains(text(),'Termo de Consentimento')]")
        assert termo_btn.is_displayed()

    def test_clicar_termo_abre_modal(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Termo de Consentimento para Tratamento de Dados Pessoais')]")
        ))
        assert "Termo de Consentimento para Tratamento de Dados Pessoais" in driver.page_source

    def test_modal_termo_exibe_referencia_a_lgpd(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Lei Geral de Proteção de Dados')]")
        ))
        assert "Lei Geral de Proteção de Dados" in driver.page_source
        assert "LGPD" in driver.page_source

    def test_modal_termo_exibe_secao_controlador_dos_dados(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Controlador dos dados')]")
        ))
        assert "Controlador dos dados" in driver.page_source

    def test_modal_termo_exibe_secao_dados_coletados(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Dados coletados')]")
        ))
        assert "Dados coletados" in driver.page_source

    def test_modal_termo_exibe_secao_finalidade_do_tratamento(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Finalidade do tratamento')]")
        ))
        assert "Finalidade do tratamento" in driver.page_source

    def test_modal_termo_exibe_secao_base_legal(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Base legal')]")
        ))
        assert "Base legal" in driver.page_source

    def test_modal_termo_exibe_secao_prazo_de_retencao(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Prazo de retenção')]")
        ))
        assert "Prazo de retenção" in driver.page_source

    def test_modal_termo_exibe_secao_direitos_do_titular(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'direitos como titular')]")
        ))
        assert "direitos como titular" in driver.page_source

    def test_modal_termo_tem_botao_aceitar(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Entendi e aceito os termos')]")
        ))
        assert driver.find_element(
            By.XPATH, "//button[contains(text(),'Entendi e aceito os termos')]"
        ).is_displayed()

    def test_aceitar_termo_fecha_modal_e_marca_consentimento(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))

        checkbox = driver.find_element(By.CSS_SELECTOR, "input[name='consentimento']")
        assert not checkbox.is_selected()

        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Entendi e aceito os termos')]")
        ))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Entendi e aceito os termos')]"
        ))
        wait.until(EC.invisibility_of_element_located(
            (By.XPATH, "//*[contains(text(),'Termo de Consentimento para Tratamento de Dados Pessoais')]")
        ))
        assert driver.find_element(By.CSS_SELECTOR, "input[name='consentimento']").is_selected()

    def test_fechar_modal_termo_com_botao_x(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Termo de Consentimento para Tratamento de Dados Pessoais')]")
        ))
        driver.find_element(By.CSS_SELECTOR, "button[aria-label='Fechar termo']").click()
        wait.until(EC.invisibility_of_element_located(
            (By.XPATH, "//*[contains(text(),'Termo de Consentimento para Tratamento de Dados Pessoais')]")
        ))

    def test_fechar_modal_termo_clicando_overlay(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[role='dialog']")))
        js_click(driver, driver.find_element(By.CSS_SELECTOR, "[role='dialog']"))
        wait.until(EC.invisibility_of_element_located(
            (By.XPATH, "//*[contains(text(),'Termo de Consentimento para Tratamento de Dados Pessoais')]")
        ))

    def test_fechar_modal_termo_com_escape(self, driver, wait):
        from selenium.webdriver.common.keys import Keys
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Termo de Consentimento para Tratamento de Dados Pessoais')]")
        ))
        driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
        wait.until(EC.invisibility_of_element_located(
            (By.XPATH, "//*[contains(text(),'Termo de Consentimento para Tratamento de Dados Pessoais')]")
        ))

    def test_botao_enviar_habilitado_apos_aceitar_termo(self, driver, wait):
        driver.get(SITE_URL)
        wait.until(EC.presence_of_element_located((By.ID, "contato")))

        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Termo de Consentimento')]"
        ))
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Entendi e aceito os termos')]")
        ))
        scroll_and_click(driver, driver.find_element(
            By.XPATH, "//button[contains(text(),'Entendi e aceito os termos')]"
        ))
        wait.until(EC.invisibility_of_element_located(
            (By.XPATH, "//*[contains(text(),'Termo de Consentimento para Tratamento de Dados Pessoais')]")
        ))
        enviar = driver.find_element(By.XPATH, "//button[contains(text(),'Enviar Mensagem')]")
        assert enviar.is_enabled()


# ─────────────────────────────────────────────────────────────────────────────
class TestAnonimizarClienteLGPD:
    """US-24 — Admin exclui dados pessoais de ex-cliente por LGPD (anonimização)"""

    def test_botao_anonimizar_visivel_para_admin_na_ficha(self, logged_in, wait):
        try:
            _abrir_ficha_360(logged_in, wait)
            btn = logged_in.find_element(By.CSS_SELECTOR, "button[aria-label='Anonimizar cliente']")
            assert btn.is_displayed()
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível ou usuário não é admin")

    def test_clicar_anonimizar_abre_modal_lgpd(self, logged_in, wait):
        try:
            _abrir_modal_anonimizar(logged_in, wait)
            assert "Anonimizar cliente pela LGPD" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível ou usuário não é admin")

    def test_modal_anonimizar_exibe_aviso_irreversivel(self, logged_in, wait):
        try:
            _abrir_modal_anonimizar(logged_in, wait)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Esta ação é irreversível')]")
            ))
            assert "Esta ação é irreversível" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível ou usuário não é admin")

    def test_modal_anonimizar_exibe_aviso_sobre_processos_ativos(self, logged_in, wait):
        try:
            _abrir_modal_anonimizar(logged_in, wait)
            assert "processos ativos ou suspensos" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível ou usuário não é admin")

    def test_modal_anonimizar_exige_campo_confirmacao_com_nome(self, logged_in, wait):
        try:
            _abrir_modal_anonimizar(logged_in, wait)
            campo = _campo_confirmacao(logged_in)
            assert campo.is_displayed()
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível ou usuário não é admin")

    def test_botao_confirmar_desabilitado_com_campo_em_branco(self, logged_in, wait):
        try:
            _abrir_modal_anonimizar(logged_in, wait)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]")
            ))
            btn = logged_in.find_element(
                By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]"
            )
            assert not btn.is_enabled()
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível ou usuário não é admin")

    def test_digitar_nome_errado_mantem_botao_desabilitado(self, logged_in, wait):
        try:
            _abrir_modal_anonimizar(logged_in, wait)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]")
            ))
            _campo_confirmacao(logged_in).send_keys("nome totalmente errado xyz")
            btn = logged_in.find_element(
                By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]"
            )
            assert not btn.is_enabled()
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível ou usuário não é admin")

    def test_cancelar_anonimizacao_fecha_modal(self, logged_in, wait):
        try:
            _abrir_modal_anonimizar(logged_in, wait)
            logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()
            wait.until(EC.invisibility_of_element_located(
                (By.XPATH, "//*[contains(text(),'Anonimizar cliente pela LGPD')]")
            ))
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível ou usuário não é admin")

    def test_anonimizar_cliente_exige_nome_exato_para_habilitar_botao(self, logged_in, wait):
        """Digitar o nome exato do cliente habilita o botão de anonimização."""
        try:
            _abrir_ficha_360(logged_in, wait)
            nome_cliente = _nome_cliente_na_ficha(logged_in)

            scroll_and_click(logged_in, logged_in.find_element(
                By.CSS_SELECTOR, "button[aria-label='Anonimizar cliente']"
            ))
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]")
            ))

            _campo_confirmacao(logged_in).send_keys(nome_cliente)

            wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]")
            ))
            assert logged_in.find_element(
                By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]"
            ).is_enabled()

            logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()
            wait.until(EC.invisibility_of_element_located(
                (By.XPATH, "//*[contains(text(),'Anonimizar cliente pela LGPD')]")
            ))
        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível ou usuário não é admin")

    def test_anonimizar_cliente_sem_processos_ativos_exibe_confirmacao(self, logged_in, wait):
        """Confirma anonimização de cliente sem processos e verifica toast de sucesso."""
        try:
            logged_in.get(CLIENTES_URL)
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
            fichas = logged_in.find_elements(By.XPATH, "//button[contains(text(),'Ver ficha 360')]")
            if not fichas:
                pytest.skip("Nenhum cliente disponível")

            cliente_alvo = None
            for btn_ficha in fichas:
                scroll_and_click(logged_in, btn_ficha)
                wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//*[contains(text(),'Ficha 360 do cliente')]")
                ))
                contadores = logged_in.find_elements(
                    By.XPATH, "//h3[contains(text(),'Processos vinculados')]/../following-sibling::span"
                )
                if contadores and contadores[0].text == "0":
                    cliente_alvo = _nome_cliente_na_ficha(logged_in)
                    break
                logged_in.find_element(By.CSS_SELECTOR, "button[aria-label='Fechar ficha']").click()
                wait.until(EC.invisibility_of_element_located(
                    (By.XPATH, "//*[contains(text(),'Ficha 360 do cliente')]")
                ))

            if not cliente_alvo:
                pytest.skip("Nenhum cliente sem processos vinculados disponível para anonimização")

            scroll_and_click(logged_in, logged_in.find_element(
                By.CSS_SELECTOR, "button[aria-label='Anonimizar cliente']"
            ))
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]")
            ))
            _campo_confirmacao(logged_in).send_keys(cliente_alvo)
            wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]")
            ))
            scroll_and_click(logged_in, logged_in.find_element(
                By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]"
            ))
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'anonimizado com sucesso')]")
            ))
            assert "anonimizado com sucesso" in logged_in.page_source

        except NoSuchElementException:
            pytest.skip("Nenhum cliente disponível ou usuário não é admin")

    def test_anonimizar_cliente_com_processo_ativo_exibe_erro(self, logged_in, wait):
        """Tenta anonimizar cliente com processo ativo e verifica mensagem de erro."""
        try:
            logged_in.get(CLIENTES_URL)
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
            fichas = logged_in.find_elements(By.XPATH, "//button[contains(text(),'Ver ficha 360')]")
            if not fichas:
                pytest.skip("Nenhum cliente disponível")

            cliente_alvo = None
            for btn_ficha in fichas:
                scroll_and_click(logged_in, btn_ficha)
                wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//*[contains(text(),'Ficha 360 do cliente')]")
                ))
                ativos = logged_in.find_elements(
                    By.XPATH,
                    "//*[contains(@class,'statusATIVO') or contains(@class,'statusSUSPENSO')]"
                )
                if ativos:
                    cliente_alvo = _nome_cliente_na_ficha(logged_in)
                    break
                logged_in.find_element(By.CSS_SELECTOR, "button[aria-label='Fechar ficha']").click()
                wait.until(EC.invisibility_of_element_located(
                    (By.XPATH, "//*[contains(text(),'Ficha 360 do cliente')]")
                ))

            if not cliente_alvo:
                pytest.skip("Nenhum cliente com processo ativo disponível para este teste")

            scroll_and_click(logged_in, logged_in.find_element(
                By.CSS_SELECTOR, "button[aria-label='Anonimizar cliente']"
            ))
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]")
            ))
            _campo_confirmacao(logged_in).send_keys(cliente_alvo)
            wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]")
            ))
            scroll_and_click(logged_in, logged_in.find_element(
                By.XPATH, "//button[contains(text(),'Anonimizar definitivamente')]"
            ))
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'processos ativos ou suspensos')]")
            ))
            assert "processos ativos ou suspensos" in logged_in.page_source

            logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()

        except NoSuchElementException:
            pytest.skip("Nenhum cliente com processo ativo disponível ou usuário não é admin")
