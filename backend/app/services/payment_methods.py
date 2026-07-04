"""Способы оплаты KOLOS."""

PAYMENT_METHODS = {
    "card": {
        "id": "card",
        "title": "Банковская карта",
        "description": "Visa, Mastercard, МИР",
        "icon": "credit-card",
        "yookassa_type": "bank_card",
    },
    "sbp": {
        "id": "sbp",
        "title": "СБП",
        "description": "Система быстрых платежей",
        "icon": "smartphone",
        "yookassa_type": "sbp",
    },
    "sberpay": {
        "id": "sberpay",
        "title": "SberPay",
        "description": "Оплата через СберБанк",
        "icon": "landmark",
        "yookassa_type": "sberbank",
    },
    "yoomoney": {
        "id": "yoomoney",
        "title": "ЮMoney",
        "description": "Кошелёк ЮMoney",
        "icon": "wallet",
        "yookassa_type": "yoo_money",
    },
    "mock": {
        "id": "mock",
        "title": "Тестовая оплата",
        "description": "Мгновенный доступ (режим разработки)",
        "icon": "zap",
        "yookassa_type": None,
    },
}


def get_yookassa_payment_method(method_id: str) -> str | None:
    method = PAYMENT_METHODS.get(method_id)
    return method["yookassa_type"] if method else None


def list_payment_methods(include_mock: bool = False) -> list[dict]:
    methods = []
    for key, m in PAYMENT_METHODS.items():
        if key == "mock" and not include_mock:
            continue
        methods.append({k: v for k, v in m.items() if k != "yookassa_type"})
    return methods
