import os
import mysql.connector
from mysql.connector import Error

DEFAULT_DB_CONFIG = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "",
    "database": "pet_vida",
}


def connect_db(config=None):
    config = config or DEFAULT_DB_CONFIG
    try:
        connection = mysql.connector.connect(**config)
        if connection.is_connected():
            return connection
    except Error as err:
        raise RuntimeError(f"Erro ao conectar ao banco de dados: {err}")


def run_sql_file(connection, sql_file_path):
    with open(sql_file_path, "r", encoding="utf-8") as f:
        sql_script = f.read()

    cursor = connection.cursor()
    for result in cursor.execute(sql_script, multi=True):
        pass
    connection.commit()
    cursor.close()


def fetch_all(connection, query, params=None):
    cursor = connection.cursor(dictionary=True)
    cursor.execute(query, params or ())
    rows = cursor.fetchall()
    cursor.close()
    return rows


def get_agenda_hoje(connection):
    query = "SELECT * FROM vw_agenda_hoje"
    return fetch_all(connection, query)


def get_faturamento_mensal(connection, ano=None, mes=None):
    query = "SELECT * FROM vw_faturamento_mensal"
    rows = fetch_all(connection, query)
    if ano is not None:
        rows = [row for row in rows if row["ano"] == ano]
    if mes is not None:
        rows = [row for row in rows if row["mes"] == mes]
    return rows


def get_animais_detalhados(connection):
    query = "SELECT * FROM vw_animais_detalhados"
    return fetch_all(connection, query)


def get_inadimplentes(connection):
    query = "SELECT * FROM vw_inadimplentes"
    return fetch_all(connection, query)


def print_rows(rows):
    if not rows:
        print("Nenhum resultado encontrado.")
        return

    keys = list(rows[0].keys())
    header = " | ".join(keys)
    print(header)
    print("-" * len(header))
    for row in rows:
        values = [str(row[key]) for key in keys]
        print(" | ".join(values))


def load_database_schema():
    config = DEFAULT_DB_CONFIG.copy()
    config.pop("database", None)
    connection = connect_db(config)
    try:
        run_sql_file(connection, os.path.join(os.path.dirname(__file__), "pet_vida_schema.sql"))
        print("Banco de dados inicializado com sucesso.")
    finally:
        connection.close()


def choose_option():
    menu = [
        "1 - Ver agenda de hoje",
        "2 - Ver faturamento mensal",
        "3 - Ver animais detalhados",
        "4 - Ver inadimplentes",
        "5 - Inicializar banco de dados a partir do schema",
        "0 - Sair",
    ]
    print("\n=== PET_VIDA ===")
    print("\n".join(menu))
    return input("Escolha uma opção: ").strip()


def main():
    while True:
        option = choose_option()
        if option == "0":
            break

        if option == "5":
            load_database_schema()
            continue

        try:
            connection = connect_db()
        except RuntimeError as err:
            print(err)
            print("Atualize as credenciais em pet_vida_app.py ou certifique-se de que o servidor MySQL está ativo.")
            break

        try:
            if option == "1":
                rows = get_agenda_hoje(connection)
                print_rows(rows)
            elif option == "2":
                ano = input("Ano (pressione Enter para todos): ").strip()
                mes = input("Mês (1-12, pressione Enter para todos): ").strip()
                ano = int(ano) if ano else None
                mes = int(mes) if mes else None
                rows = get_faturamento_mensal(connection, ano, mes)
                print_rows(rows)
            elif option == "3":
                rows = get_animais_detalhados(connection)
                print_rows(rows)
            elif option == "4":
                rows = get_inadimplentes(connection)
                print_rows(rows)
            else:
                print("Opção inválida. Tente novamente.")
        finally:
            connection.close()


if __name__ == "__main__":
    main()
