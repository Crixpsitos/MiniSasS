export const Pagination = ({
  page,
  changePage,
  hasNext,
}: {
  page: number;
  changePage: (newPage: number) => void;
  hasNext: boolean;
}) => {
  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={() => changePage(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      <div className="bg-gray-100 rounded px-3 py-1 mx-1">
        <span className="px-3 py-1">{page}</span>
      </div>
      <button
        onClick={() => changePage(page + 1)}
        disabled={!hasNext}
        className="px-3 py-1 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  )
}
