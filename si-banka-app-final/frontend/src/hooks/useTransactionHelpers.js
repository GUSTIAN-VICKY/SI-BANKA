/**
 * useTransactionHelpers — Hook untuk Analisis Data Transaksi
 * 
 * Fungsi-fungsi kalkulasi/analisis yang sebelumnya ada di Dashboard.jsx.
 * Dipindah ke hook terpisah agar Dashboard.jsx lebih bersih dan fokus pada rendering.
 */

/**
 * Hitung trend setoran mingguan (7 hari terakhir).
 * 
 * @param {Array} transactions  Daftar transaksi
 * @returns {Array}  Array of {day, value} untuk chart
 */
export const getWeeklyTrend = (transactions) => {
    const trend = [
        { day: 'Min', value: 0 },
        { day: 'Sen', value: 0 },
        { day: 'Sel', value: 0 },
        { day: 'Rab', value: 0 },
        { day: 'Kam', value: 0 },
        { day: 'Jum', value: 0 },
        { day: 'Sab', value: 0 },
    ];

    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    transactions.forEach((trx) => {
        const dateSource = trx.created_at || trx.date;
        if (!dateSource) return;

        const dateString = dateSource.replace(' ', 'T');
        const trxDate = new Date(dateString);
        if (isNaN(trxDate.getTime())) return;

        const compareDate = new Date(trxDate);
        compareDate.setHours(0, 0, 0, 0);

        const todayReset = new Date();
        todayReset.setHours(23, 59, 59, 999);

        if (compareDate >= last7Days && compareDate <= todayReset) {
            const dayIndex = trxDate.getDay();
            const items = typeof trx.items === 'string' ? JSON.parse(trx.items || '[]') : trx.items || [];
            const totalKg = items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0);

            if (trend[dayIndex]) {
                trend[dayIndex].value += totalKg;
            }
        }
    });

    // Urutkan: Senin - Minggu
    return [
        trend.find((d) => d.day === 'Sen'),
        trend.find((d) => d.day === 'Sel'),
        trend.find((d) => d.day === 'Rab'),
        trend.find((d) => d.day === 'Kam'),
        trend.find((d) => d.day === 'Jum'),
        trend.find((d) => d.day === 'Sab'),
        trend.find((d) => d.day === 'Min'),
    ].filter(Boolean);
};

/**
 * Hitung trend setoran bulanan per nasabah.
 * 
 * @param {string} customerId   ID nasabah
 * @param {Array}  transactions  Daftar transaksi
 * @returns {Array}  Array of {day: monthName, value: total}
 */
export const getCustomerTrend = (customerId, transactions) => {
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    transactions.forEach((trx) => {
        if (trx.customerId === customerId) {
            const trxDate = new Date(trx.date);
            if (isNaN(trxDate)) return;

            const monthName = monthNames[trxDate.getMonth()];
            if (!monthlyData[monthName]) monthlyData[monthName] = 0;
            monthlyData[monthName] += parseFloat(trx.total);
        }
    });

    return Object.keys(monthlyData).map((month) => ({ day: month, value: monthlyData[month] }));
};

/**
 * Cari jenis sampah favorit (paling banyak disetorkan) oleh nasabah.
 * 
 * @param {string} customerId   ID nasabah
 * @param {Array}  transactions  Daftar transaksi
 * @returns {string}  Nama jenis sampah favorit
 */
export const getFavoriteWaste = (customerId, transactions) => {
    const wasteCount = {};

    transactions.forEach((trx) => {
        if (trx.customerId === customerId) {
            (trx.items || []).forEach((item) => {
                wasteCount[item.name] = (wasteCount[item.name] || 0) + parseFloat(item.qty || 0);
            });
        }
    });

    let favorite = 'Belum Ada';
    let maxQty = 0;
    for (const [name, qty] of Object.entries(wasteCount)) {
        if (qty > maxQty) {
            maxQty = qty;
            favorite = name;
        }
    }

    return favorite;
};

/**
 * Kumpulkan dan groupkan transaksi nasabah untuk stacked chart.
 * Grouping per tanggal, dengan breakdown per jenis sampah.
 * 
 * @param {string} customerId   ID nasabah
 * @param {Array}  transactions  Daftar transaksi
 * @returns {Array}  Array of {id, date, fullDate, total, items[]}
 */
export const getCustomerTransactionsForChart = (customerId, transactions) => {
    const customerTrx = transactions
        .filter((t) => t.customerId === customerId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const groupedByDate = {};

    customerTrx.forEach((trx) => {
        const dateKey = new Date(trx.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        const shortDate = new Date(trx.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
        });

        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = {
                date: shortDate,
                fullDate: dateKey,
                total: 0,
                items: {},
            };
        }

        const items = typeof trx.items === 'string' ? JSON.parse(trx.items || '[]') : trx.items || [];
        groupedByDate[dateKey].total += parseFloat(trx.total || 0);

        items.forEach((item) => {
            const qty = parseFloat(item.qty || item.weight || 0);
            const val = parseFloat(item.total || 0);

            if (!groupedByDate[dateKey].items[item.name]) {
                groupedByDate[dateKey].items[item.name] = { name: item.name, value: 0, qty: 0 };
            }
            groupedByDate[dateKey].items[item.name].qty += qty;
            groupedByDate[dateKey].items[item.name].value += val;
        });
    });

    return Object.values(groupedByDate).map((group) => ({
        id: group.fullDate,
        date: group.date,
        fullDate: group.fullDate,
        total: group.total,
        items: Object.values(group.items),
    }));
};
