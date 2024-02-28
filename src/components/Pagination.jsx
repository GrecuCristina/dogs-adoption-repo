import React from "react";
import { Pagination as BootstrapPagination } from "react-bootstrap";
import classnames from "classnames";

export default function Pagination(props) {
  if (props.pagesCount <= 1) {
    return null;
  }
  return (
    <BootstrapPagination className={classnames(props.className)}>
      <BootstrapPagination.First
        disabled={props.currentPage === 0}
        onClick={() => props.gotoPage(0)}
      />
      <BootstrapPagination.Prev
        disabled={props.currentPage === 0}
        onClick={() => props.gotoPage(Math.max(props.currentPage - 1, 0))}
      />
      <BootstrapPagination.Item active>
        {props.currentPage + 1}
      </BootstrapPagination.Item>
      <BootstrapPagination.Item disabled>/</BootstrapPagination.Item>
      <BootstrapPagination.Item disabled>
        {props.pagesCount}
      </BootstrapPagination.Item>
      <BootstrapPagination.Next
        disabled={props.currentPage === props.pagesCount - 1}
        onClick={() =>
          props.gotoPage(Math.min(props.currentPage + 1, props.pagesCount - 1))
        }
      />
      <BootstrapPagination.Last
        disabled={props.currentPage === props.pagesCount - 1}
        onClick={() => props.gotoPage(props.pagesCount - 1)}
      />
    </BootstrapPagination>
  );
}
