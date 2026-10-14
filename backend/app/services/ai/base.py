from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class AIProvider(ABC):
    @abstractmethod
    async def generate_explanation(
        self,
        question: str,
        evidence_context: Dict[str, Any],
        conversation_history: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Generate an evidence-grounded scientific explanation for a user question based on structured evidence.
        """
        pass

    @abstractmethod
    async def generate_report(self, evidence_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a structured scientific mutation analysis report.
        """
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """
        Check if the AI provider model server is online and available.
        """
        pass
