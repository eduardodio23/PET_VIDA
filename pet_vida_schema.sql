DROP DATABASE IF EXISTS pet_vida;
CREATE DATABASE IF NOT EXISTS pet_vida;
USE pet_vida;

CREATE TABLE especies (
    id_especie INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE veterinarios (
    id_veterinario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    crmv VARCHAR(20) NOT NULL UNIQUE,
    especialidade VARCHAR(50) NOT NULL,
    telefone VARCHAR(15) NOT NULL
);

CREATE TABLE tutores (
    id_tutor INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(100) NOT NULL
);

CREATE TABLE animais (
    id_animal INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    especie_id INT NOT NULL,
    raca VARCHAR(50),
    sexo VARCHAR(9),
    peso FLOAT NOT NULL,
    data_nascimento DATE,
    tutor_id INT NOT NULL,
    CONSTRAINT fk_animais_especies FOREIGN KEY (especie_id) REFERENCES especies(id_especie),
    CONSTRAINT fk_animais_tutor FOREIGN KEY (tutor_id) REFERENCES tutores(id_tutor)
);

CREATE TABLE consultas (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    veterinario_id INT NOT NULL,
    data_hora DATETIME NOT NULL,
    diagnostico TEXT,
    valor DECIMAL(10, 2) NOT NULL,
    status ENUM('agendada', 'em_atendimento', 'concluida', 'cancelada') NOT NULL,
    CONSTRAINT fk_consultas_animais FOREIGN KEY (animal_id) REFERENCES animais(id_animal),
    CONSTRAINT fk_consultas_veterinarios FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id_veterinario)
);

CREATE TABLE pagamentos (
    id_pagamento INT AUTO_INCREMENT PRIMARY KEY,
    consulta_id INT NOT NULL,
    valor_pago DECIMAL(10, 2) NOT NULL,
    forma_pagamento ENUM('pix', 'cartao', 'dinheiro', 'convenio') NOT NULL,
    data_pagamento DATE NOT NULL,
    status ENUM('pago', 'pendente', 'cancelado') NOT NULL,
    CONSTRAINT fk_pagamentos_consultas FOREIGN KEY (consulta_id) REFERENCES consultas(id_consulta)
);

CREATE INDEX idx_consultas_data_hora ON consultas(data_hora);
CREATE INDEX idx_animais_tutor_id ON animais(tutor_id);
CREATE INDEX idx_pagamentos_consulta_id ON pagamentos(consulta_id);

INSERT INTO especies (nome) VALUES ('Cachorro'), ('Gato'), ('Pássaro'), ('Peixe'), ('Réptil');

INSERT INTO veterinarios (nome, crmv, especialidade, telefone) VALUES
('Ana Souza', 'CRMV-BA 123', 'Clínica Geral', '(71) 98567-1011'),
('Carlos Lima', 'CRMV-BA 456', 'Dermatologia', '(71) 98988-4422'),
('Beatriz Silva', 'CRMV-BA 789', 'Cirurgia', '(71) 97690-1333');

INSERT INTO tutores (nome, cpf, email, telefone) VALUES
('JOÃO FERREIRA', '100.456.321-22', 'joao@email.com', '(71) 97890-7810'),
('ROBERTO CARLOS', '567.674.214-89', 'roberto@email.com', '(71) 92467-2090'),
('RICARDO NUNES', '864.411.745-97', 'ricardo@email.com', '(71) 99989-3856'),
('LUCAS BARBALHO', '865.336.685-86', 'lucas@email.com', '(71) 97589-4898'),
('ELISANGELA REALE', '540.900.100-75', 'elisangela@email.com', '(71) 97696-5150'),
('MARIA ALMEIDA', '111.222.333-44', 'maria@email.com', '(71) 98888-1111'),
('FERNANDO COSTA', '555.666.777-88', 'fernando@email.com', '(71) 97777-2222'),
('PATRÍCIA LIMA', '999.888.777-66', 'patricia@email.com', '(71) 96666-3333');

INSERT INTO animais (nome, especie_id, raca, sexo, peso, data_nascimento, tutor_id) VALUES
('Rex', 1, 'Labrador', 'Macho', 22.5, '2020-05-10', 1),
('Thor', 1, 'Poodle', 'Macho', 10.1, '2021-08-15', 1),
('Luna', 2, 'Siamês', 'Fêmea', 5.00, '2019-02-20', 2),
('Bolinha', 2, 'SRD', 'Fêmea', 9.00, '2022-01-10', 2),
('Mel', 1, 'Beagle', 'Fêmea', 15.00, '2018-11-05', 3),
('Pipoca', 1, 'Lulu', 'Fêmea', 3.5, '2026-03-12', 4),
('Fred', 1, 'Golden', 'Macho', 40.5, '2017-06-30', 5),
('Piu', 3, 'Calopsita', 'Macho', 0.1, '2022-05-01', 6),
('Nemo', 4, 'Palhaço', 'Macho', 0.05, '2026-01-15', 6),
('Dino', 5, 'Iguana', 'Macho', 1.2, '2021-12-10', 7),
('Mia', 2, 'Persa', 'Fêmea', 4.5, '2020-07-22', 8),
('Bidu', 1, 'Schnauzer', 'Macho', 8.0, '2019-09-09', 8),
('Kiko', 3, 'Papagaio', 'Macho', 0.4, '2015-04-14', 1),
('Bela', 1, 'Pug', 'Fêmea', 7.5, '2021-11-11', 2),
('Simba', 2, 'Maine Coon', 'Macho', 9.5, '2018-03-03', 3);

INSERT INTO consultas (animal_id, veterinario_id, data_hora, diagnostico, valor, status) VALUES
(1, 1, '2026-10-01 10:00:00', 'Vacinação anual', 150.00, 'concluida'),
(2, 1, '2026-10-01 11:30:00', 'Check-up geral', 120.00, 'concluida'),
(3, 2, '2026-10-02 14:00:00', 'Alergia alimentar', 200.00, 'concluida'),
(4, 2, '2026-10-02 15:30:00', 'Otite', 180.00, 'concluida'),
(5, 3, '2026-10-03 09:00:00', 'Avaliação cirúrgica', 250.00, 'concluida'),
(6, 1, '2026-10-03 10:30:00', 'Unhas compridas', 50.00, 'concluida'),
(7, 3, '2026-10-04 13:00:00', 'Limpeza de tártaro', 400.00, 'concluida'),
(8, 2, '2026-10-10 16:00:00', 'Troca de penas', 100.00, 'concluida'),
(9, 1, '2026-10-11 08:30:00', 'Análise de aquário', 80.00, 'concluida'),
(10, 3, '2026-10-12 11:00:00', 'Corte nas garras', 150.00, 'concluida'),
(11, 1, '2026-11-01 09:00:00', 'Vacina V4', 120.00, 'concluida'),
(12, 2, '2026-11-02 10:00:00', 'Dermatite', 180.00, 'concluida'),
(13, 1, '2026-11-03 14:00:00', 'Apareio bico', 90.00, 'concluida'),
(14, 3, '2026-11-04 15:30:00', 'Consulta oftalmológica', 220.00, 'concluida'),
(15, 2, '2026-11-05 16:00:00', 'Check-up renal', 200.00, 'concluida'),
(1, 1, '2026-12-01 09:00:00', NULL, 150.00, 'agendada'),
(2, 2, '2026-12-02 10:30:00', NULL, 180.00, 'agendada'),
(3, 3, '2026-12-03 14:00:00', NULL, 300.00, 'cancelada'),
(4, 1, '2026-12-04 15:00:00', NULL, 120.00, 'agendada'),
(5, 2, '2026-12-05 16:30:00', NULL, 200.00, 'em_atendimento');

INSERT INTO pagamentos (consulta_id, valor_pago, forma_pagamento, data_pagamento, status) VALUES
(1, 150.00, 'pix', '2026-10-01', 'pago'),
(2, 120.00, 'cartao', '2026-10-01', 'pago'),
(3, 200.00, 'dinheiro', '2026-10-02', 'pago'),
(4, 180.00, 'pix', '2026-10-02', 'pago'),
(5, 250.00, 'cartao', '2026-10-03', 'pago'),
(6, 50.00, 'dinheiro', '2026-10-03', 'pago'),
(7, 400.00, 'convenio', '2026-10-04', 'pago'),
(8, 100.00, 'pix', '2026-10-10', 'pago'),
(9, 80.00, 'cartao', '2026-10-11', 'pago'),
(10, 150.00, 'dinheiro', '2026-10-12', 'pago'),
(11, 120.00, 'convenio', '2026-11-01', 'pago'),
(12, 180.00, 'pix', '2026-11-02', 'pago'),
(13, 90.00, 'cartao', '2026-11-03', 'pago'),
(14, 220.00, 'dinheiro', '2026-11-04', 'pago'),
(15, 200.00, 'pix', '2026-11-05', 'pago'),
(16, 150.00, 'cartao', '2026-12-01', 'pendente'),
(17, 180.00, 'convenio', '2026-12-02', 'pendente'),
(18, 0.00, 'pix', '2026-12-03', 'cancelado'),
(19, 120.00, 'dinheiro', '2026-12-04', 'pendente'),
(20, 200.00, 'cartao', '2026-12-05', 'pendente');

CREATE OR REPLACE VIEW vw_consultas_completas AS
SELECT 
    c.data_hora, c.status, c.diagnostico, c.valor, 
    a.nome AS animal, e.nome AS especie, 
    t.nome AS tutor, t.telefone AS telefone, 
    v.nome AS veterinario, v.especialidade, 
    p.forma_pagamento, p.status AS status_pagamento
FROM consultas c
JOIN animais a ON c.animal_id = a.id_animal
JOIN especies e ON a.especie_id = e.id_especie
JOIN tutores t ON a.tutor_id = t.id_tutor
JOIN veterinarios v ON c.veterinario_id = v.id_veterinario
LEFT JOIN pagamentos p ON p.consulta_id = c.id_consulta;

CREATE OR REPLACE VIEW vw_agenda_hoje AS
SELECT * FROM vw_consultas_completas
WHERE DATE(data_hora) = CURDATE()
ORDER BY TIME(data_hora);

CREATE OR REPLACE VIEW vw_faturamento_mensal AS
SELECT 
    YEAR(data_hora) AS ano,
    MONTH(data_hora) AS mes,
    veterinario,
    COUNT(*) AS total_consultas,
    SUM(valor) AS faturamento_total
FROM vw_consultas_completas
GROUP BY YEAR(data_hora), MONTH(data_hora), veterinario;

CREATE OR REPLACE VIEW vw_animais_detalhados AS
SELECT 
    a.nome AS animal, t.nome AS tutor, e.nome AS especie,
    COUNT(c.id_consulta) AS total_consultas
FROM animais a
JOIN tutores t ON a.tutor_id = t.id_tutor
JOIN especies e ON a.especie_id = e.id_especie
LEFT JOIN consultas c ON c.animal_id = a.id_animal
GROUP BY a.id_animal, a.nome, t.nome, e.nome;

CREATE OR REPLACE VIEW vw_inadimplentes AS
SELECT * FROM vw_consultas_completas
WHERE status = 'concluida'
  AND (status_pagamento IS NULL OR status_pagamento = 'pendente');
