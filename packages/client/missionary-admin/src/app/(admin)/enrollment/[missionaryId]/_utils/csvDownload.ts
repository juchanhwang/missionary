import { participationApi } from 'apis/participation';

export async function downloadCsv(
  missionaryId: string,
  fileName: string,
): Promise<void> {
  const response = await participationApi.downloadCsv(missionaryId);
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
