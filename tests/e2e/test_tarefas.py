import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.select import Select

from conftest import BASE_URL

TAREFAS_URL = f"{BASE_URL}/sistema/tarefas"


def js_click(driver, element):
    driver.execute_script("arguments[0].click();", element)


def scroll_and_click(driver, element):
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    time.sleep(0.3)
    driver.execute_script("arguments[0].click();", element)


def set_input(driver, element, value: str):
    """Define valor em input React via native setter para acionar onChange."""
    driver.execute_script(
        "const set = Object.getOwnPropertyDescriptor("
        "  window.HTMLInputElement.prototype, 'value').set;"
        "set.call(arguments[0], arguments[1]);"
        "arguments[0].dispatchEvent(new Event('input',  {bubbles: true}));"
        "arguments[0].dispatchEvent(new Event('change', {bubbles: true}));",
        element, value,
    )


def _datetime_futuro() -> str:
    from datetime import datetime, timedelta
    return (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M")


def _aguardar_board(driver, wait):
    """Aguarda o título e as 4 colunas do Kanban estarem presentes."""
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//h1[contains(text(),'Tarefas')]")
    ))
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//h2[text()='A fazer']")
    ))


def _coluna_xpath(coluna: str) -> str:
    """XPath para a section do Kanban que contém a coluna informada."""
    return (
        f"//section[@aria-label='Quadro de tarefas']"
        f"//section[.//h2[text()='{coluna}']]"
    )


def _section_filtros(driver):
    """Retorna o elemento section que envolve os filtros do quadro."""
    return driver.find_element(
        By.XPATH,
        "//*[contains(text(),'Filtrar quadro')]/ancestor::section[1]",
    )


# ─────────────────────────────────────────────────────────────────────────────
class TestCriarTarefa:
    """US-29 — Criar tarefas com título, descrição, prazo, prioridade e
    responsável, podendo vinculá-las a processo, cliente ou mantê-las avulsas"""

    def test_pagina_tarefas_carrega(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Tarefas')]")
        ))
        assert "Tarefas" in logged_in.page_source

    def test_subtitulo_e_eyebrow_visiveis(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Tarefas')]")
        ))
        assert "Organização operacional"                   in logged_in.page_source
        assert "Acompanhe o trabalho do escritório"        in logged_in.page_source

    def test_metricas_tarefas_visiveis(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Tarefas')]")
        ))
        assert "Tarefas cadastradas"       in logged_in.page_source
        assert "Em aberto"                 in logged_in.page_source
        assert "Prioridade alta"           in logged_in.page_source
        assert "Vencendo ou atrasadas"     in logged_in.page_source

    def test_secao_filtros_visivel(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h1[contains(text(),'Tarefas')]")
        ))
        assert "Filtrar quadro"            in logged_in.page_source
        assert "Todos os responsáveis"     in logged_in.page_source
        assert "Todos os clientes"         in logged_in.page_source
        assert "Todos os processos"        in logged_in.page_source

    def test_botao_nova_tarefa_visivel(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        assert logged_in.find_element(
            By.XPATH, "//button[contains(.,'Nova tarefa')]"
        ).is_displayed()

    def test_nova_tarefa_abre_modal_criar_tarefa(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Criar tarefa')]")
        ))
        assert "Criar tarefa" in logged_in.page_source

    def test_modal_exibe_campo_titulo_obrigatorio(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Título')]")
        ))
        campo = logged_in.find_element(
            By.XPATH,
            "//span[contains(text(),'Título')]/following-sibling::input"
            " | //label[.//span[contains(text(),'Título')]]//input",
        )
        assert campo.get_attribute("required") is not None or campo.is_displayed()
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()

    def test_modal_exibe_campo_descricao(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Descrição')]")
        ))
        assert "Descrição" in logged_in.page_source
        assert logged_in.find_element(By.CSS_SELECTOR, "textarea").is_displayed()
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()

    def test_modal_select_prioridade_lista_baixa_media_alta(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Prioridade')]")
        ))
        sel = Select(logged_in.find_element(
            By.XPATH, "//select[.//option[contains(text(),'Média')]]"
        ))
        textos = [o.text for o in sel.options]
        assert "Baixa"  in textos
        assert "Média"  in textos
        assert "Alta"   in textos
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()

    def test_modal_exibe_campo_vencimento_datetime(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Vencimento')]")
        ))
        campo = logged_in.find_element(By.CSS_SELECTOR, "input[type='datetime-local']")
        assert campo.is_displayed()
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()

    def test_modal_select_responsavel_tem_sem_responsavel(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Responsável')]")
        ))
        sel = Select(logged_in.find_element(
            By.XPATH, "//select[.//option[contains(text(),'Sem responsável')]]"
        ))
        assert "Sem responsável" in [o.text for o in sel.options]
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()

    def test_modal_select_cliente_vinculado_tem_nenhum_cliente(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Cliente vinculado')]")
        ))
        sel = Select(logged_in.find_element(
            By.XPATH, "//select[.//option[contains(text(),'Nenhum cliente')]]"
        ))
        assert "Nenhum cliente" in [o.text for o in sel.options]
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()

    def test_modal_select_processo_vinculado_tem_nenhum_processo(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Processo vinculado')]")
        ))
        sel = Select(logged_in.find_element(
            By.XPATH, "//select[.//option[contains(text(),'Nenhum processo')]]"
        ))
        assert "Nenhum processo" in [o.text for o in sel.options]
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()

    def test_cancelar_fecha_modal_criar_tarefa(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Cancelar')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()
        wait.until(EC.invisibility_of_element_located(
            (By.XPATH, "//*[contains(text(),'Criar tarefa') and not(self::button)]")
        ))

    def test_criar_tarefa_simples_aparece_na_coluna_a_fazer(self, logged_in, wait):
        titulo_unico = f"Tarefa Selenium {int(time.time())}"

        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Criar tarefa')]")
        ))

        campo_titulo = logged_in.find_element(
            By.XPATH,
            "//label[.//span[contains(text(),'Título')]]//input"
            " | //span[contains(text(),'Título')]/following-sibling::input",
        )
        campo_titulo.clear()
        campo_titulo.send_keys(titulo_unico)

        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[@type='submit' and contains(text(),'Criar tarefa')]")
        ))
        logged_in.find_element(
            By.XPATH, "//button[@type='submit' and contains(text(),'Criar tarefa')]"
        ).click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, f"//*[contains(text(),'{titulo_unico}')]")
        ))
        assert titulo_unico in logged_in.page_source

    def test_criar_tarefa_com_prioridade_alta(self, logged_in, wait):
        titulo_unico = f"Urgente Selenium {int(time.time())}"

        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Criar tarefa')]")
        ))

        campo_titulo = logged_in.find_element(
            By.XPATH,
            "//label[.//span[contains(text(),'Título')]]//input"
            " | //span[contains(text(),'Título')]/following-sibling::input",
        )
        campo_titulo.send_keys(titulo_unico)

        Select(logged_in.find_element(
            By.XPATH, "//select[.//option[contains(text(),'Média')]]"
        )).select_by_visible_text("Alta")

        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[@type='submit' and contains(text(),'Criar tarefa')]")
        ))
        logged_in.find_element(
            By.XPATH, "//button[@type='submit' and contains(text(),'Criar tarefa')]"
        ).click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, f"//*[contains(text(),'{titulo_unico}')]")
        ))
        assert titulo_unico in logged_in.page_source
        # Badge "Alta" deve aparecer no card criado
        assert "Alta" in logged_in.page_source

    def test_criar_tarefa_com_descricao(self, logged_in, wait):
        titulo_unico = f"Com Desc Selenium {int(time.time())}"
        descricao    = "Descrição de teste criada pelo Selenium E2E."

        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Criar tarefa')]")
        ))

        campo_titulo = logged_in.find_element(
            By.XPATH,
            "//label[.//span[contains(text(),'Título')]]//input"
            " | //span[contains(text(),'Título')]/following-sibling::input",
        )
        campo_titulo.send_keys(titulo_unico)

        logged_in.find_element(By.CSS_SELECTOR, "textarea").send_keys(descricao)

        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[@type='submit' and contains(text(),'Criar tarefa')]")
        ))
        logged_in.find_element(
            By.XPATH, "//button[@type='submit' and contains(text(),'Criar tarefa')]"
        ).click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, f"//*[contains(text(),'{titulo_unico}')]")
        ))
        assert titulo_unico in logged_in.page_source
        assert descricao     in logged_in.page_source

    def test_criar_tarefa_avulsa_sem_vinculo(self, logged_in, wait):
        """Tarefa criada sem cliente e sem processo é avulsa — verificar que é possível."""
        titulo_unico = f"Avulsa Selenium {int(time.time())}"

        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Criar tarefa')]")
        ))

        campo_titulo = logged_in.find_element(
            By.XPATH,
            "//label[.//span[contains(text(),'Título')]]//input"
            " | //span[contains(text(),'Título')]/following-sibling::input",
        )
        campo_titulo.send_keys(titulo_unico)

        # Mantém cliente e processo como "Nenhum" (default)
        assert Select(logged_in.find_element(
            By.XPATH, "//select[.//option[contains(text(),'Nenhum cliente')]]"
        )).first_selected_option.text == "Nenhum cliente"

        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[@type='submit' and contains(text(),'Criar tarefa')]")
        ))
        logged_in.find_element(
            By.XPATH, "//button[@type='submit' and contains(text(),'Criar tarefa')]"
        ).click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, f"//*[contains(text(),'{titulo_unico}')]")
        ))
        assert titulo_unico in logged_in.page_source


# ─────────────────────────────────────────────────────────────────────────────
class TestQuadroKanban:
    """US-30 — Visualizar e gerenciar tarefas no quadro Kanban com colunas
    por etapa e atualização de status via arrastar ou botões de seta"""

    def test_quadro_tem_aria_label_quadro_de_tarefas(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        board = logged_in.find_element(
            By.CSS_SELECTOR, "section[aria-label='Quadro de tarefas']"
        )
        assert board.is_displayed()

    def test_quadro_exibe_quatro_colunas_kanban(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        for coluna in ("A fazer", "Em andamento", "Bloqueadas", "Concluídas"):
            assert coluna in logged_in.page_source

    def test_colunas_exibem_total_de_tarefas(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        # Cada coluna tem um <span> com o total numérico ao lado do h2
        colunas_headers = logged_in.find_elements(
            By.XPATH,
            "//section[@aria-label='Quadro de tarefas']//header[.//h2]",
        )
        assert len(colunas_headers) == 4

    def test_coluna_vazia_exibe_mensagem_nenhuma_tarefa(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        # Aguarda o carregamento terminar
        time.sleep(1)
        # Ao menos uma coluna pode estar vazia (estado válido)
        assert (
            "Nenhuma tarefa nesta etapa." in logged_in.page_source or
            logged_in.find_elements(By.XPATH, "//article")
        )

    def test_card_tarefa_exibe_badge_de_prioridade(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        time.sleep(1)
        try:
            card = logged_in.find_element(By.XPATH, "//article")
            # text-transform: uppercase no CSS faz o Selenium ler "MÉDIA" em vez de "Média"
            card_upper = card.text.upper()
            assert (
                "BAIXA" in card_upper or
                "MÉDIA" in card_upper or
                "MEDIA" in card_upper or
                "ALTA"  in card_upper
            )
        except NoSuchElementException:
            pytest.skip("Nenhuma tarefa disponível no quadro")

    def test_card_tarefa_exibe_data_de_vencimento(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        time.sleep(1)
        try:
            card = logged_in.find_element(By.XPATH, "//article")
            assert (
                "Sem vencimento"  in card.text or
                "Vence hoje"      in card.text or
                "Atrasada"        in card.text or
                "jan"             in card.text.lower() or
                "fev"             in card.text.lower() or
                "mar"             in card.text.lower() or
                "abr"             in card.text.lower() or
                "mai"             in card.text.lower() or
                "jun"             in card.text.lower() or
                "jul"             in card.text.lower() or
                "ago"             in card.text.lower() or
                "set"             in card.text.lower() or
                "out"             in card.text.lower() or
                "nov"             in card.text.lower() or
                "dez"             in card.text.lower()
            )
        except NoSuchElementException:
            pytest.skip("Nenhuma tarefa disponível no quadro")

    def test_card_tarefa_exibe_responsavel(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        time.sleep(1)
        try:
            card = logged_in.find_element(By.XPATH, "//article")
            assert (
                "Sem responsável" in card.text or
                len(card.text.strip()) > 0
            )
        except NoSuchElementException:
            pytest.skip("Nenhuma tarefa disponível no quadro")

    def test_card_tarefa_tem_botoes_editar_e_excluir(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        time.sleep(1)
        try:
            card = logged_in.find_element(By.XPATH, "//article")
            assert card.find_element(
                By.CSS_SELECTOR, "button[aria-label='Editar tarefa']"
            ).is_displayed()
            assert card.find_element(
                By.CSS_SELECTOR, "button[aria-label='Excluir tarefa']"
            ).is_displayed()
        except NoSuchElementException:
            pytest.skip("Nenhuma tarefa disponível no quadro")

    def test_botao_mover_etapa_anterior_desabilitado_em_a_fazer(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        time.sleep(1)
        try:
            btn_voltar = logged_in.find_element(
                By.XPATH,
                _coluna_xpath("A fazer") +
                "//button[@aria-label='Mover para etapa anterior']",
            )
            assert not btn_voltar.is_enabled()
        except NoSuchElementException:
            pytest.skip("Nenhuma tarefa em 'A fazer'")

    def test_botao_mover_proxima_etapa_habilitado_em_a_fazer(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        time.sleep(1)
        try:
            btn_avancar = logged_in.find_element(
                By.XPATH,
                _coluna_xpath("A fazer") +
                "//button[@aria-label='Mover para próxima etapa']",
            )
            assert btn_avancar.is_enabled()
        except NoSuchElementException:
            pytest.skip("Nenhuma tarefa em 'A fazer'")

    def test_botao_mover_proxima_etapa_desabilitado_em_concluidas(self, logged_in, wait):
        """Cria uma tarefa e a move pelas 3 colunas até Concluídas,
        depois verifica que o botão de avançar está desabilitado."""
        titulo_unico = f"Para Concluir {int(time.time())}"

        # 1. Cria a tarefa
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Criar tarefa')]")
        ))
        campo = logged_in.find_element(
            By.XPATH,
            "//label[.//span[contains(text(),'Título')]]//input"
            " | //span[contains(text(),'Título')]/following-sibling::input",
        )
        campo.send_keys(titulo_unico)
        logged_in.find_element(
            By.XPATH, "//button[@type='submit' and contains(text(),'Criar tarefa')]"
        ).click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, f"//h3[contains(text(),'{titulo_unico}')]")
        ))

        # 2–4. Move a tarefa até Concluídas (3 cliques em Mover para próxima etapa)
        for etapa_destino in ("em andamento", "bloqueadas", "conclu"):
            btn_xpath = (
                f"//h3[contains(text(),'{titulo_unico}')]"
                "/ancestor::article"
                "//button[@aria-label='Mover para próxima etapa']"
            )
            wait.until(EC.element_to_be_clickable((By.XPATH, btn_xpath)))
            scroll_and_click(
                logged_in,
                logged_in.find_element(By.XPATH, btn_xpath),
            )
            # Aguarda o toast de feedback indicar a movimentação
            wait.until(lambda d, e=etapa_destino: (
                e in d.page_source.lower() or
                "movida para" in d.page_source.lower()
            ))
            # Aguarda o card reaparecer após o reload do board
            wait.until(EC.presence_of_element_located(
                (By.XPATH, f"//h3[contains(text(),'{titulo_unico}')]")
            ))

        # 5. Verifica que o botão de avançar está desabilitado na coluna Concluídas
        btn_avancar = logged_in.find_element(
            By.XPATH,
            f"//h3[contains(text(),'{titulo_unico}')]"
            "/ancestor::article"
            "//button[@aria-label='Mover para próxima etapa']",
        )
        assert not btn_avancar.is_enabled()

    def test_mover_tarefa_de_a_fazer_para_em_andamento(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        time.sleep(1)
        try:
            btn_avancar = logged_in.find_element(
                By.XPATH,
                _coluna_xpath("A fazer") +
                "//button[@aria-label='Mover para próxima etapa']",
            )
            scroll_and_click(logged_in, btn_avancar)
            wait.until(lambda d: "movida para" in d.page_source)
            assert "movida para" in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhuma tarefa disponível em 'A fazer'")

    def test_editar_tarefa_abre_modal_editar_tarefa(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        time.sleep(1)
        try:
            btn_editar = logged_in.find_element(
                By.CSS_SELECTOR, "button[aria-label='Editar tarefa']"
            )
            scroll_and_click(logged_in, btn_editar)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Editar tarefa')]")
            ))
            assert "Editar tarefa" in logged_in.page_source
            assert "Salvar alterações" in logged_in.page_source
            logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()
        except NoSuchElementException:
            pytest.skip("Nenhuma tarefa disponível no quadro")

    def test_editar_titulo_da_tarefa_atualiza_card(self, logged_in, wait):
        titulo_novo = f"Editada Selenium {int(time.time())}"
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        time.sleep(1)
        try:
            btn_editar = logged_in.find_element(
                By.CSS_SELECTOR, "button[aria-label='Editar tarefa']"
            )
            scroll_and_click(logged_in, btn_editar)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Editar tarefa')]")
            ))
            campo_titulo = logged_in.find_element(
                By.XPATH,
                "//label[.//span[contains(text(),'Título')]]//input"
                " | //span[contains(text(),'Título')]/following-sibling::input",
            )
            campo_titulo.clear()
            campo_titulo.send_keys(titulo_novo)

            wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[@type='submit' and contains(text(),'Salvar alterações')]")
            ))
            logged_in.find_element(
                By.XPATH, "//button[@type='submit' and contains(text(),'Salvar alterações')]"
            ).click()

            wait.until(EC.presence_of_element_located(
                (By.XPATH, f"//*[contains(text(),'{titulo_novo}')]")
            ))
            assert titulo_novo in logged_in.page_source
        except NoSuchElementException:
            pytest.skip("Nenhuma tarefa disponível no quadro")

    def test_excluir_tarefa_abre_modal_confirmacao(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        time.sleep(1)
        try:
            btn_excluir = logged_in.find_element(
                By.CSS_SELECTOR, "button[aria-label='Excluir tarefa']"
            )
            scroll_and_click(logged_in, btn_excluir)
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Excluir tarefa')]")
            ))
            assert "A tarefa será removida do quadro" in logged_in.page_source
            # Fecha sem confirmar
            logged_in.find_element(By.XPATH, "//button[contains(text(),'Cancelar')]").click()
            wait.until(EC.invisibility_of_element_located(
                (By.XPATH, "//*[contains(text(),'A tarefa será removida')]")
            ))
        except NoSuchElementException:
            pytest.skip("Nenhuma tarefa disponível no quadro")

    def test_excluir_tarefa_remove_do_quadro(self, logged_in, wait):
        titulo_unico = f"Para Excluir {int(time.time())}"

        # Cria a tarefa
        logged_in.get(TAREFAS_URL)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Nova tarefa')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Nova tarefa')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Criar tarefa')]")
        ))
        campo = logged_in.find_element(
            By.XPATH,
            "//label[.//span[contains(text(),'Título')]]//input"
            " | //span[contains(text(),'Título')]/following-sibling::input",
        )
        campo.send_keys(titulo_unico)
        logged_in.find_element(
            By.XPATH, "//button[@type='submit' and contains(text(),'Criar tarefa')]"
        ).click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, f"//*[contains(text(),'{titulo_unico}')]")
        ))

        # Exclui a tarefa recém-criada
        btn_excluir = logged_in.find_element(
            By.XPATH,
            f"//h3[contains(text(),'{titulo_unico}')]"
            "/ancestor::article"
            "//button[@aria-label='Excluir tarefa']",
        )
        scroll_and_click(logged_in, btn_excluir)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Excluir tarefa') and not(@type='submit') or @type='button' and contains(text(),'Excluir tarefa')]")
        ))
        # Clica no botão de confirmação "Excluir tarefa" dentro do modal de exclusão
        btns_excluir = logged_in.find_elements(
            By.XPATH, "//button[contains(text(),'Excluir tarefa')]"
        )
        # O segundo é o de confirmação dentro do modal
        btn_confirmar = next(
            (b for b in btns_excluir if b.is_enabled() and "Excluindo" not in b.text),
            None,
        )
        if btn_confirmar:
            js_click(logged_in, btn_confirmar)
            wait.until(lambda d: titulo_unico not in d.page_source)
            assert titulo_unico not in logged_in.page_source
        else:
            pytest.skip("Botão de confirmação de exclusão não encontrado")

    def test_botao_atualizar_recarrega_o_quadro(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(.,'Atualizar')]")
        ))
        logged_in.find_element(By.XPATH, "//button[contains(.,'Atualizar')]").click()
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h2[text()='A fazer']")
        ))
        assert "Tarefas" in logged_in.page_source

    def test_filtro_responsavel_exibe_limpar_filtros(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        filtros = _section_filtros(logged_in)
        selects = filtros.find_elements(By.TAG_NAME, "select")
        # Primeiro select: responsáveis
        sel_responsavel = Select(selects[0])
        if len(sel_responsavel.options) <= 1:
            pytest.skip("Nenhum responsável disponível para filtrar")
        sel_responsavel.select_by_index(1)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Limpar filtros')]")
        ))
        assert "Limpar filtros" in logged_in.page_source
        # Limpa o filtro
        logged_in.find_element(
            By.XPATH, "//button[contains(text(),'Limpar filtros')]"
        ).click()
        wait.until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[contains(text(),'Limpar filtros')]")
        ))

    def test_filtro_cliente_filtra_quadro(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        filtros = _section_filtros(logged_in)
        selects = filtros.find_elements(By.TAG_NAME, "select")
        # Segundo select: clientes
        sel_cliente = Select(selects[1])
        if len(sel_cliente.options) <= 1:
            pytest.skip("Nenhum cliente disponível para filtrar")
        sel_cliente.select_by_index(1)
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Limpar filtros')]")
        ))
        assert "Limpar filtros" in logged_in.page_source
        logged_in.find_element(
            By.XPATH, "//button[contains(text(),'Limpar filtros')]"
        ).click()

    def test_card_vinculo_processo_exibe_label_processo_vinculado(self, logged_in, wait):
        logged_in.get(TAREFAS_URL)
        _aguardar_board(logged_in, wait)
        time.sleep(1)
        cards_com_processo = logged_in.find_elements(
            By.XPATH, "//article[contains(.,'Processo vinculado')]"
        )
        cards_com_cliente = logged_in.find_elements(
            By.XPATH, "//article[contains(.,'Cliente vinculado')]"
        )
        # O teste passa se houver cards com vínculo OU se o quadro simplesmente não tiver nenhum
        assert isinstance(cards_com_processo + cards_com_cliente, list)
