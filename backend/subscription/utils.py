from calendar import monthrange
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP


FREQUENCY_TO_DAYS = {
    "daily": 1,
    "alternate_days": 2,
    "weekly": 7,
}


def add_months_clamped(value: date, months: int = 1) -> date:
    target_month_index = (value.month - 1) + months
    year = value.year + (target_month_index // 12)
    month = (target_month_index % 12) + 1
    day = min(value.day, monthrange(year, month)[1])
    return date(year, month, day)


def calculate_delivery_count(start_date, end_date, frequency: str) -> int:
    if not start_date:
        return 0

    if end_date is None:
        return 1

    if end_date < start_date:
        return 0

    deliveries = 0
    current = start_date

    if frequency == "monthly":
        while current <= end_date:
            deliveries += 1
            current = add_months_clamped(current, 1)
        return deliveries

    step_days = FREQUENCY_TO_DAYS.get(frequency, 1)
    while current <= end_date:
        deliveries += 1
        current += timedelta(days=step_days)

    return deliveries


def estimate_subscription_amount(product_price, quantity: int, start_date, end_date, frequency: str) -> Decimal:
    deliveries = calculate_delivery_count(start_date, end_date, frequency)
    if deliveries <= 0:
        return Decimal("0.00")

    unit_price = Decimal(str(product_price))
    total = unit_price * Decimal(quantity) * Decimal(deliveries)
    return total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
