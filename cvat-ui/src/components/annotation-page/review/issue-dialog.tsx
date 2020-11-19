// Copyright (C) 2020 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col } from 'antd/lib/grid';
import Comment from 'antd/lib/comment';
import Title from 'antd/lib/typography/Title';
import Tooltip from 'antd/lib/tooltip';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import moment from 'moment';

interface Props {
    id: number;
    comments: any[];
    left: number;
    top: number;
    resolved: boolean;
    isFetching: boolean;
    collapse: () => void;
    resolve: () => void;
    reopen: () => void;
    comment: (message: string) => void;
}

export default function IssueDialog(props: Props): JSX.Element {
    const ref = useRef<HTMLDivElement>();
    const [currentText, setCurrentText] = useState<string>('');
    const {
        comments, id, left, top, resolved, isFetching, collapse, resolve, reopen, comment,
    } = props;

    useEffect(() => {
        const region = window.document.getElementById(`cvat_canvas_issue_region_${id}`);
        if (region) {
            region.style.display = '';
        }

        let element: HTMLDivElement | null = null;
        const eventlistener = (): void => {
            if (element && element.parentNode) {
                element.parentNode.appendChild(element);
            }
        };

        if (ref.current) {
            element = ref.current;
            element.addEventListener('mouseenter', eventlistener);
        }

        return () => {
            if (element) {
                element.removeEventListener('mouseenter', eventlistener);
            }
        };
    }, []);

    const lines = comments.map(
        (_comment: any): JSX.Element => {
            const created = _comment.createdDate ? moment(_comment.createdDate) : moment(moment.now());
            const diff = created.fromNow();

            return (
                <Comment
                    key={_comment.id}
                    author={_comment.author ? _comment.author.username : 'Unknown'}
                    content={<p>{_comment.message}</p>}
                    datetime={(
                        <Tooltip title={created.format('MMMM Do YYYY')}>
                            <span>{diff}</span>
                        </Tooltip>
                    )}
                />
            );
        },
    );

    const resolveButton = resolved ? (
        <Button loading={isFetching} type='primary' onClick={reopen}>
            Reopen
        </Button>
    ) : (
        <Button loading={isFetching} type='primary' onClick={resolve}>
            Resolve
        </Button>
    );

    return ReactDOM.createPortal(
        <div style={{ top, left }} ref={ref} className='cvat-issue-dialog'>
            <Row className='cvat-issue-dialog-header' type='flex' justify='space-between'>
                <Col>
                    <Title level={4}>{id >= 0 ? `Issue #${id}` : 'New Issue'}</Title>
                </Col>
                <Col>
                    <Tooltip title='Collapse the chat'>
                        <Icon type='close' onClick={collapse} />
                    </Tooltip>
                </Col>
            </Row>
            <Row className='cvat-issue-dialog-chat' type='flex' justify='start'>
                <Col style={{ display: 'block' }}>{lines}</Col>
            </Row>
            <Row className='cvat-issue-dialog-input' type='flex' justify='start'>
                <Col span={24}>
                    <Input
                        placeholder='Print a comment here..'
                        value={currentText}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setCurrentText(event.target.value);
                        }}
                        onPressEnter={() => {
                            if (currentText) {
                                comment(currentText);
                                setCurrentText('');
                            }
                        }}
                    />
                </Col>
            </Row>
            <Row className='cvat-issue-dialog-footer' type='flex' justify='end'>
                <Col>
                    {currentText.length ? (
                        <Button
                            loading={isFetching}
                            type='primary'
                            disabled={!currentText.length}
                            onClick={() => {
                                comment(currentText);
                                setCurrentText('');
                            }}
                        >
                            Comment
                        </Button>
                    ) : (
                        resolveButton
                    )}
                </Col>
            </Row>
        </div>,
        window.document.getElementById('cvat_canvas_attachment_board') as HTMLElement,
    );
}
