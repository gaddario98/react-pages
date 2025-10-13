import { PageProps } from "../types";
import { FieldValues } from "react-hook-form";
import { QueriesArray } from "@gaddario98/react-queries";
/**
 * Main page generator component that orchestrates page rendering
 * Handles authentication, content generation, and layout management
 * @param enableAuthControl - Whether to enable authentication control
 * @param meta - Page metadata configuration
 * @param props - Additional page properties
 */
declare const PageGenerator: <F extends FieldValues = FieldValues, Q extends QueriesArray = QueriesArray>({ enableAuthControl, meta, ...props }: PageProps<F, Q>) => import("react/jsx-runtime").JSX.Element;
export default PageGenerator;
