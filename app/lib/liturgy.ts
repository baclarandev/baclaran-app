// /* =====================================================
//    Liturgical API Helper
// ===================================================== */
// const getLiturgicalSeason = async (date: Date) => {
//   const year = date.getFullYear();
//   const mm = String(date.getMonth() + 1).padStart(2, "0");
//   const dd = String(date.getDate()).padStart(2, "0");

//   const res = await fetch(
//     `https://cpbjr.github.io/catholic-readings-api/liturgical-calendar/${year}/${mm}-${dd}.json`
//   );
//   const data = await res.json();
//   return data?.season || "Ordinary Time";
// };

// /* =====================================================
//    Day Color Mapping
// ===================================================== */
// const seasonColors: Record<string, string> = {
//   "Advent": "#4B0082",
//   "Christmas": "#FFD700",
//   "Lent": "#FF0000",
//   "Easter": "#FFFF00",
//   "Ordinary Time": "#FFFFFF",
//   "Martyr": "#FF0000",
//   "Feast": "#FF0000",
// };

// /* =====================================================
//    Usage in Attendance Table
// ===================================================== */

// {member.days.map((attended, index) => {
//   const date = new Date(year, month, index + 1);
//   const [color, setColor] = useState("#FFFFFF");

//   useEffect(() => {
//     getLiturgicalSeason(date).then(season => {
//       setColor(seasonColors[season] || "#FFFFFF");
//     });
//   }, [date]);

//   return (
//     <td key={index} className="border-r text-center">
//       <button
//         style={{ backgroundColor: color }}
//         onClick={() => incrementAttendance(member.id, index)}
//         onContextMenu={(e) => {
//           e.preventDefault();
//           resetAttendance(member.id, index);
//         }}
//         className="w-6 h-6 text-xs rounded hover:bg-gray-300"
//       >
//         {attended}
//       </button>
//     </td>
//   );
// })}
