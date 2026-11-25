import LegalPage from './LegalPage'
import { privacy } from './legalContent'

export default function Privacy() {
  return <LegalPage doc={privacy} kind="privacy" path="/privacy" />
}
