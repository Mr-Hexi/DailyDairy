from decimal import Decimal
from uuid import uuid4


class MockPaymentGateway:
    STATUS_SUCCESS = "success"
    STATUS_FAILED = "failed"
    STATUS_PENDING = "pending"

    SCENARIO_SUCCESS = "success"
    SCENARIO_FAILURE = "failure"
    SCENARIO_PENDING = "pending"

    @classmethod
    def charge(cls, amount: Decimal, payment_method: str, scenario: str = SCENARIO_SUCCESS):
        gateway_txn_id = f"MOCK-{uuid4().hex[:12].upper()}"

        if scenario == cls.SCENARIO_FAILURE:
            return {
                "ok": False,
                "gateway_status": cls.STATUS_FAILED,
                "gateway_transaction_id": gateway_txn_id,
                "message": "Mock gateway declined the transaction.",
                "payment_method": payment_method,
                "amount": str(amount),
            }

        if scenario == cls.SCENARIO_PENDING:
            return {
                "ok": True,
                "gateway_status": cls.STATUS_PENDING,
                "gateway_transaction_id": gateway_txn_id,
                "message": "Mock gateway marked payment as pending.",
                "payment_method": payment_method,
                "amount": str(amount),
            }

        return {
            "ok": True,
            "gateway_status": cls.STATUS_SUCCESS,
            "gateway_transaction_id": gateway_txn_id,
            "message": "Mock gateway approved payment.",
            "payment_method": payment_method,
            "amount": str(amount),
        }
