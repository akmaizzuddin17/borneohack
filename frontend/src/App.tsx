import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QnAPanel from './pages/QnAPanel';
import Checklist from './pages/Checklist';
import Translation from './pages/Translation';
import FormDChecker from './pages/FormDChecker';
import CountryGuide from './pages/CountryGuide';
import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/qna" element={<QnAPanel />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/translation" element={<Translation />} />
        <Route path="/form-d" element={<FormDChecker />} />
        <Route path="/countries" element={<CountryGuide />} />
      </Routes>
      <BottomNav />
    </Router>
  );
}
