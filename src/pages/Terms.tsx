import LegalPage from './LegalPage'
import { terms } from './legalContent'

export default function Terms() {
  return <LegalPage doc={terms} kind="terms" path="/terms" />
}
