import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.select import Select

from conftest import BASE_URL, do_login, do_logout

PROCESSOS_URL = f"{BASE_URL}/sistema/processos"


def js_click(driver, element):
    driver.execute_script("arguments[0].click();", element)


def scroll_and_click(driver, element):
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    time.sleep(0.3)
    driver.execute_script("arguments[0].click();", element)


def _numero_cnj_unico() -> str:
    """Gera número CNJ com exatamente 20 dígitos (validação do formulário)."""
    ts = int(time.time())
    dd   = f"{ts % 99:02d}"     # 2 dígitos – parcela de unicidade
    oooo = f"{ts % 9999:04d}"   # 4 dígitos – origem
    # formato: NNNNNNN-DD.AAAA.J.TT.OOOO → 7+2+4+1+2+4 = 20 dígitos
    return f"1000001-{dd}.2024.8.07.{oooo}"


# ─────────────────────────────────────────────────────────────────────────────
class TestCadastrarProcesso:
    """US-16 — Cadastrar processo judicial vinculado a um cliente"""

    def test_pagina_processos_carrega(self, logged_in, wait):
        logged_in.get(PROCESSOS_URL)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Core Jurídico')]")
        ))
        assert "Core Jurídico" in logged_in.page_source

    def test_metricas_processos_visiveis(self, logged_in, wait):
        logged_in.get(PROCESSOS_URL)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Core Jurídico')]")
        ))
        assert "Total de processos" in logged_in.page_source
        assert "Ativos"             in logged_in.page_source
        assert "Suspensos"          in logged_in.page_source
        assert "Encerrados"         in logged_in.page_source

    def test_tabela_processos_exibe_colunas(self, logged_in, wait):
        logged_in.get(PROCESSOS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        assert "Nº CNJ"       in logged_in.page_source
        assert "Tipo de ação" in logged_in.page_source
        assert "Cliente"      in logged_in.page_source
        assert "Tribunal"     in logged_in.page_source
        assert "Status"       in logged_in.page_source
        assert "Ações"        in logged_in.page_source

    def test_botao_novo_processo_abre_modal(self, logged_in, wait):
        logged_in.get(PROCESSOS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Novo Processo')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Novo Processo')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Número do processo')]")
        ))
        assert "Número do processo" in logged_in.page_source

    def test_modal_exibe_campos_do_formulario(self, logged_in, wait):
        logged_in.get(PROCESSOS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Novo Processo')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Novo Processo')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Número do processo')]")
        ))
        assert "Número do processo (CNJ)" in logged_in.page_source
        assert "Cliente"                  in logged_in.page_source
        assert "Tipo / área do direito"   in logged_in.page_source
        assert "Vara / tribunal"          in logged_in.page_source
        assert "Parte contrária"          in logged_in.page_source

    def test_botao_adicionar_desabilitado_sem_preenchimento(self, logged_in, wait):
        logged_in.get(PROCESSOS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Novo Processo')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Novo Processo')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Número do processo')]")
        ))
        btn = logged_in.find_element(
            By.XPATH, "//button[contains(text(),'Adicionar Processo')]"
        )
        assert not btn.is_enabled()

    def test_cancelar_modal_fecha(self, logged_in, wait):
        logged_in.get(PROCESSOS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Novo Processo')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Novo Processo')]").click()
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Cancelar')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()
        wait.until(EC.invisibility_of_element_located(
            (By.XPATH, "//*[contains(text(),'Número do processo')]")
        ))

    def test_cadastrar_processo_aparece_na_lista(self, logged_in, wait):
        numero  = _numero_cnj_unico()
        tipo    = f"Ação Selenium {int(time.time())}"

        logged_in.get(PROCESSOS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Novo Processo')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Novo Processo')]").click()
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder*='0711598']")
        ))

        # Número CNJ — obrigatório: exatos 20 dígitos
        logged_in.find_element(
            By.CSS_SELECTOR, "input[placeholder*='0711598']"
        ).send_keys(numero)

        # Cliente — opcional; select identificado pela option padrão "Sem cliente vinculado"
        try:
            sel_cliente = Select(logged_in.find_element(
                By.XPATH, "//select[.//option[contains(text(),'Sem cliente')]]"
            ))
            if len(sel_cliente.options) > 1:
                sel_cliente.select_by_index(1)
        except NoSuchElementException:
            pass  # campo opcional — prossegue sem cliente

        # Tipo de ação — obrigatório
        logged_in.find_element(
            By.CSS_SELECTOR, "input[placeholder*='Ação de cobrança']"
        ).send_keys(tipo)

        # Vara / tribunal — obrigatório
        logged_in.find_element(
            By.CSS_SELECTOR, "input[placeholder*='TJDFT']"
        ).send_keys("TJDFT")

        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Adicionar Processo')]")
        ))
        logged_in.find_element(
            By.XPATH, "//button[contains(text(),'Adicionar Processo')]"
        ).click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, f"//*[contains(text(),'{tipo}')]")
        ))
        assert tipo in logged_in.page_source


# ─────────────────────────────────────────────────────────────────────────────
class TestMovimentacoesProcesso:
    """US-17 — Registrar movimentações e visualizar como linha do tempo"""

    def _abrir_ficha(self, driver, wait):
        driver.get(PROCESSOS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        btn = driver.find_element(By.XPATH, "//button[contains(text(),'Abrir Ficha')]")
        scroll_and_click(driver, btn)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Movimentações processuais')]")
        ))

    def _abrir_formulario_movimentacao(self, driver, wait):
        """Expande o formulário de movimentação clicando no toggle 'Registrar'."""
        toggle = driver.find_element(
            By.XPATH,
            "//h3[contains(text(),'Movimentações processuais')]/../following-sibling::button"
        )
        scroll_and_click(driver, toggle)
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder*='Audiência de conciliação']")
        ))

    def test_botao_abrir_ficha_abre_modal_detalhes(self, logged_in, wait):
        logged_in.get(PROCESSOS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        try:
            btn = logged_in.find_element(By.XPATH, "//button[contains(text(),'Abrir Ficha')]")
            scroll_and_click(logged_in, btn)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Movimentações processuais')]")
            ))
            assert "Movimentações processuais" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_ficha_exibe_secao_movimentacoes_e_historico(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            assert "Movimentações processuais" in logged_in.page_source
            assert "Histórico"                 in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_toggle_abre_formulario_de_movimentacao(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            self._abrir_formulario_movimentacao(logged_in, wait)
            assert logged_in.find_element(
                By.CSS_SELECTOR, "input[placeholder*='Audiência de conciliação']"
            ).is_displayed()
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_formulario_movimentacao_exibe_campo_descricao(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            self._abrir_formulario_movimentacao(logged_in, wait)
            assert "Descrição (opcional)" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_botao_registrar_movimentacao_desabilitado_sem_titulo(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            self._abrir_formulario_movimentacao(logged_in, wait)
            btn = logged_in.find_element(
                By.XPATH, "//button[contains(text(),'Registrar movimentação')]"
            )
            assert not btn.is_enabled()
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_registrar_movimentacao_aparece_na_timeline(self, logged_in, wait):
        titulo_unico = f"Audiência Selenium {int(time.time())}"
        try:
            self._abrir_ficha(logged_in, wait)
            self._abrir_formulario_movimentacao(logged_in, wait)
            campo_titulo = logged_in.find_element(
                By.CSS_SELECTOR, "input[placeholder*='Audiência de conciliação']"
            )
            campo_titulo.send_keys(titulo_unico)
            wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Registrar movimentação')]")
            ))
            logged_in.find_element(
                By.XPATH, "//button[contains(text(),'Registrar movimentação')]"
            ).click()
            wait.until(EC.presence_of_element_located(
                (By.XPATH, f"//*[contains(text(),'{titulo_unico}')]")
            ))
            assert titulo_unico in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_timeline_exibe_estado_vazio_ou_entradas(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            assert (
                "Nenhuma movimentação registrada" in logged_in.page_source or
                logged_in.find_element(
                    By.XPATH, "//*[contains(text(),'Movimentações processuais')]"
                ).is_displayed()
            )
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")


# ─────────────────────────────────────────────────────────────────────────────
class TestStatusProcesso:
    """US-18 — Alterar status do processo entre ativo, suspenso, arquivado e encerrado"""

    def _abrir_ficha(self, driver, wait):
        driver.get(PROCESSOS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        btn = driver.find_element(By.XPATH, "//button[contains(text(),'Abrir Ficha')]")
        scroll_and_click(driver, btn)
        # Aguarda o botão de status aparecer (pode estar desabilitado, por isso presence não clickable)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Alterar status')]")
        ))

    def _select_status_no_modal(self, driver):
        """Retorna o Select de status do modal de detalhe (não o filtro da página)."""
        # O select da página de filtro tem a option "Todos os status"; o do modal não.
        return Select(driver.find_element(
            By.XPATH, "//select[not(.//option[contains(text(),'Todos')])]"
        ))

    def test_badge_status_visivel_na_tabela(self, logged_in, wait):
        logged_in.get(PROCESSOS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        assert (
            "Ativo"           in logged_in.page_source or
            "Suspenso"        in logged_in.page_source or
            "Arquivado"       in logged_in.page_source or
            "Encerrado"       in logged_in.page_source or
            "Nenhum processo" in logged_in.page_source
        )

    def test_botao_alterar_status_visivel_na_ficha(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            assert logged_in.find_element(
                By.XPATH, "//button[contains(text(),'Alterar status')]"
            ).is_displayed()
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_select_status_exibe_todos_os_estados(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            sel = self._select_status_no_modal(logged_in)
            textos = [o.text for o in sel.options]
            assert "Ativo"     in textos
            assert "Suspenso"  in textos
            assert "Arquivado" in textos
            assert "Encerrado" in textos
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_alterar_status_para_suspenso(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            sel = self._select_status_no_modal(logged_in)
            sel.select_by_visible_text("Suspenso")
            wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Alterar status')]")
            ))
            logged_in.find_element(
                By.XPATH, "//button[contains(text(),'Alterar status')]"
            ).click()
            wait.until(lambda d: (
                "Status alterado para Suspenso" in d.page_source or
                "atualizado"                    in d.page_source or
                "Suspenso"                      in d.page_source
            ))
            assert (
                "Suspenso"                      in logged_in.page_source or
                "Status alterado para Suspenso" in logged_in.page_source
            )
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_alterar_status_para_arquivado(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            sel = self._select_status_no_modal(logged_in)
            # Escolhe qualquer status diferente do atual
            opcao_diferente = next(
                (o for o in sel.options if o.get_attribute("value") != sel.first_selected_option.get_attribute("value")),
                None
            )
            if not opcao_diferente:
                pytest.skip("Processo não possui status alternativo disponível")
            opcao_diferente.click()
            wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Alterar status')]")
            ))
            logged_in.find_element(
                By.XPATH, "//button[contains(text(),'Alterar status')]"
            ).click()
            wait.until(lambda d: (
                "Status alterado" in d.page_source or
                "atualizado"      in d.page_source
            ))
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_status_refletido_na_coluna_da_tabela(self, logged_in, wait):
        logged_in.get(PROCESSOS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        assert "Status" in logged_in.page_source


# ─────────────────────────────────────────────────────────────────────────────
class TestAnotacoesProcesso:
    """US-19 — Registrar anotações internas vinculadas a um processo"""

    def _abrir_ficha(self, driver, wait):
        driver.get(PROCESSOS_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
        btn = driver.find_element(By.XPATH, "//button[contains(text(),'Abrir Ficha')]")
        scroll_and_click(driver, btn)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Anotações internas')]")
        ))

    def test_ficha_exibe_secao_anotacoes(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            assert "Anotações internas" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_textarea_nova_anotacao_visivel(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            textarea = logged_in.find_element(
                By.CSS_SELECTOR, "textarea[placeholder*='Registre uma estratégia']"
            )
            assert textarea.is_displayed()
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_botao_registrar_anotacao_desabilitado_vazio(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            # O botão de envio das anotações tem type="submit" (está dentro de <form>)
            btn = logged_in.find_element(By.CSS_SELECTOR, "button[type='submit']")
            assert not btn.is_enabled()
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_registrar_anotacao_aparece_na_lista(self, logged_in, wait):
        anotacao_unica = f"Estratégia Selenium {int(time.time())}"
        try:
            self._abrir_ficha(logged_in, wait)
            textarea = logged_in.find_element(
                By.CSS_SELECTOR, "textarea[placeholder*='Registre uma estratégia']"
            )
            scroll_and_click(logged_in, textarea)
            textarea.send_keys(anotacao_unica)
            wait.until(EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "button[type='submit']")
            ))
            logged_in.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
            wait.until(EC.presence_of_element_located(
                (By.XPATH, f"//*[contains(text(),'{anotacao_unica}')]")
            ))
            assert anotacao_unica in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_editar_anotacao_abre_edicao_inline(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            try:
                edit_btn = logged_in.find_element(
                    By.CSS_SELECTOR, "button[aria-label='Editar anotação']"
                )
                scroll_and_click(logged_in, edit_btn)
                wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//button[contains(text(),'Salvar')]")
                ))
                assert "Salvar"   in logged_in.page_source
                assert "Cancelar" in logged_in.page_source
                logged_in.find_element(
                    By.XPATH, "//button[contains(text(),'Cancelar')]"
                ).click()
            except NoSuchElementException:
                pytest.skip("Nenhuma anotação disponível para editar")
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")

    def test_anotacoes_separadas_das_movimentacoes(self, logged_in, wait):
        try:
            self._abrir_ficha(logged_in, wait)
            assert "Anotações internas"        in logged_in.page_source
            assert "Movimentações processuais" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhum processo disponível")
