import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sistema/Sidebar/Sidebar';
import styles from './SistemaLayout.module.css';

export default function SistemaLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
