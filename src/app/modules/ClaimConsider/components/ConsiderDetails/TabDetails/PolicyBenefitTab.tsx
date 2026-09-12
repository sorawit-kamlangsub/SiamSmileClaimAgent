import GppGoodIcon from "@mui/icons-material/GppGood";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import usePolicyBenefitHook from "../../../hooks/ClaimConsiderDetail/PolicyBenefitHook";
import { MUIDataTableColumn } from "mui-datatables";
import { cellAlignOptions, numberWithCommas } from "../../../../../functionHelpers";
import LoadingOverlay from "../../../../_common/components/CustomComponent/LoadingOverlay";
import { StandardDataTable } from "../../../../_common";
import { TableRow, TableCell } from "@mui/material";
import { useMemo } from "react";
import { useGetCustomerDetailById } from "../../../../../api/coreClaimApi";
const renderPricePerUnit = (pricePerUnit: number | null, pricePerUnitName: string | null) => {
    if (pricePerUnit === null || pricePerUnit === undefined) return "-";
    const formatted = numberWithCommas(pricePerUnit, 0);
    return pricePerUnitName ? `${formatted} ${pricePerUnitName}` : formatted;
};

type PolicyBenefitTabProps = {
    customerDetailData?: ReturnType<typeof useGetCustomerDetailById>["data"];
};

const PolicyBenefitTab = ({ customerDetailData }: PolicyBenefitTabProps) => {
    const { benefit, benefitLoading } = usePolicyBenefitHook(customerDetailData);

    // const rows = benefit?.data || [];
    const rows = useMemo(() => {
        const raw = benefit?.data || [];
        const groupOrder: string[] = [];
        raw.forEach((row: any) => {
            if (!groupOrder.includes(row.benefitTypeName)) {
                groupOrder.push(row.benefitTypeName);
            }
        });
        return [...raw].sort(
            (a: any, b: any) => groupOrder.indexOf(a.benefitTypeName) - groupOrder.indexOf(b.benefitTypeName)
        );
    }, [benefit?.data]);

    const columns: MUIDataTableColumn[] = [
        {
            name: "benefitTypeName",
            label: "",
            options: { display: "excluded" }, // ใช้แค่ในการ group ไม่ต้องมีคอลัมน์จริง
        },
        {
            name: "benefitName",
            label: "รายละเอียดความคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
            },
        },
        {
            name: "pricePerUnit",
            label: "ความคุ้มครอง",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (value, tableMeta) => {
                    const pricePerUnitName = tableMeta.rowData[tableMeta.rowIndex ? 2 : 2]; // ดูหมายเหตุด้านล่าง
                    return renderPricePerUnit(value, pricePerUnitName);
                },
            },
        },
        {
            name: "maxPrice",
            label: "คุ้มครอง(สูงสุด)",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (value) => numberWithCommas(value, 0),
            },
        },
        {
            name: "maxQuantity",
            label: "จำนวนสูงสุด",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "quantityUnitName",
            label: "หน่วย",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
        },
    ];

    return (
        <CustomPaper>
            <HeadingWithColor icon={<GppGoodIcon sx={{ fontSize: 27 }} />} text="รายการความคุ้มครอง" color="blue" />
            <LoadingOverlay isLoading={benefitLoading} minHeight={300}>
                <StandardDataTable
                    name="benefitTable"
                    title=""
                    data={rows}
                    isLoading={benefitLoading}
                    columns={columns}
                    color="primary"
                    columnHeaderAlign="center"
                    options={{
                        customRowRender: (_data, _dataIndex, rowIndex) => {
                            const rawRow: any = rows[rowIndex];
                            const prevRow: any = rows[rowIndex - 1];
                            const showGroupHeader = !prevRow || prevRow.benefitTypeName !== rawRow.benefitTypeName;

                            return (
                                <>
                                    {showGroupHeader && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                sx={{
                                                    backgroundColor: "#E3EAF3",
                                                    fontWeight: 600,
                                                    color: "#1A3D6D",
                                                    borderBottom: "none",
                                                    py: 1,
                                                }}
                                            >
                                                {`| ${rawRow.benefitTypeName}`}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell>{rawRow.benefitName}</TableCell>
                                        <TableCell align="right">
                                            {renderPricePerUnit(rawRow.pricePerUnit, rawRow.pricePerUnitName)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {rawRow.maxPrice === null || rawRow.maxPrice === undefined
                                                ? "-"
                                                : numberWithCommas(rawRow.maxPrice, 0)}
                                        </TableCell>
                                        <TableCell align="center">{rawRow.maxQuantity ?? "-"}</TableCell>
                                        <TableCell align="left">{rawRow.quantityUnitName ?? "-"}</TableCell>
                                    </TableRow>
                                </>
                            );
                        },
                    }}
                    displayFooter={false}
                />
            </LoadingOverlay>
        </CustomPaper>
    );
};

export default PolicyBenefitTab;
