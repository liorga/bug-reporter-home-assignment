import { TABLE_COLUMNS } from './constants/index';

export function TableSkeleton() {
  return (
    <div className="table-wrapper">
      <table className="reports-table">
        <thead>
          <tr>
            {TABLE_COLUMNS.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 3 }).map((_, i) => (
            <tr key={i} className="skeleton-row">
              {TABLE_COLUMNS.map((col) => (
                <td key={col}>
                  <div className="skeleton-cell" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
