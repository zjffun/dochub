import { throttle } from "lodash-es";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { FC, forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import createDiffEditor from "./createDiffEditor";
import RelationSvg from "./RelationSvg";
import setModelToDiffEditor from "./setModelToDiffEditor";
import { IRelation } from "./types";

import "./index.scss";

export interface IMonacoDiffEditorRelationProps {
  fromOriginal: string;
  fromModified: string;
  toOriginal: string;
  toModified: string;
  relations: IRelation[];
  currentId?: string;
  fromReadOnly?: boolean;
  toReadOnly?: boolean;
  options?: FC<any>;
  onToSave?: (editor: monaco.editor.ICodeEditor) => void;
}

export interface IMonacoDiffEditorRelationRef {
  getToModifiedContent(): string | undefined;
}

const MonacoDiffEditorRelation = forwardRef<
  IMonacoDiffEditorRelationRef,
  IMonacoDiffEditorRelationProps
>(
  (
    {
      fromOriginal,
      fromModified,
      toOriginal,
      toModified,
      relations,
      currentId,
      fromReadOnly,
      toReadOnly,
      options,
      onToSave,
    },
    ref
  ) => {
    const fromDiffEditorElRef = useRef<HTMLDivElement>(null);
    const toDiffEditorElRef = useRef<HTMLDivElement>(null);
    const relationSvgElRef = useRef<SVGSVGElement>(null);

    const fromDiffEditorRef =
      useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
    const toDiffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(
      null
    );

    const monacoRelationViewRef = useRef<RelationSvg | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        getToModifiedContent() {
          const editor = toDiffEditorRef.current?.getModifiedEditor();
          const content = editor?.getValue();
          return content;
        },
      }),
      []
    );

    useEffect(() => {
      const resize = throttle(() => {
        if (fromDiffEditorRef.current) {
          fromDiffEditorRef.current.layout();
        }

        if (toDiffEditorRef.current) {
          toDiffEditorRef.current.layout();
        }

        if (monacoRelationViewRef.current) {
          monacoRelationViewRef.current.resize();
        }
      }, 500);

      window.addEventListener("resize", resize);

      return () => {
        window.removeEventListener("resize", resize);
      };
    }, []);

    useEffect(() => {
      if (!fromDiffEditorElRef.current || !toDiffEditorElRef.current) {
        return;
      }

      fromDiffEditorRef.current = createDiffEditor(fromDiffEditorElRef.current);
      toDiffEditorRef.current = createDiffEditor(toDiffEditorElRef.current);

      if (
        !relationSvgElRef.current ||
        !fromDiffEditorRef.current ||
        !toDiffEditorRef.current
      ) {
        return;
      }

      monacoRelationViewRef.current = new RelationSvg(
        fromDiffEditorRef.current,
        toDiffEditorRef.current,
        relations,
        relationSvgElRef.current,
        {
          fromContainerDomNode:
            fromDiffEditorRef.current!.getContainerDomNode(),
          toContainerDomNode: toDiffEditorRef.current!.getContainerDomNode(),
          options,
        }
      );

      return () => {
        fromDiffEditorRef.current?.dispose();
        toDiffEditorRef.current?.dispose();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (!fromDiffEditorRef.current) {
        return;
      }
      fromDiffEditorRef.current.updateOptions({
        readOnly: fromReadOnly,
      });
    }, [fromReadOnly]);

    useEffect(() => {
      if (!toDiffEditorRef.current) {
        return;
      }
      toDiffEditorRef.current.updateOptions({
        readOnly: toReadOnly,
      });
    }, [toReadOnly]);

    useEffect(() => {
      if (toDiffEditorRef.current) {
        toDiffEditorRef.current.addAction({
          id: "save",
          label: "Save",
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
          keybindingContext: "!editorReadonly",
          contextMenuGroupId: "navigation",
          contextMenuOrder: 1,
          run: (editor) => {
            onToSave?.(editor);
          },
        });
      }
    }, [onToSave]);

    useEffect(() => {
      if (monacoRelationViewRef.current) {
        monacoRelationViewRef.current.options = options;
      }
    }, [options]);

    useEffect(() => {
      if (currentId && monacoRelationViewRef.current) {
        monacoRelationViewRef.current.scrollToRelation(currentId);
      }
    }, [currentId]);

    useEffect(() => {
      (async () => {
        await setModelToDiffEditor(
          fromDiffEditorRef.current,
          fromOriginal,
          fromModified
        );

        await setModelToDiffEditor(
          toDiffEditorRef.current,
          toOriginal,
          toModified
        );

        if (monacoRelationViewRef.current) {
          monacoRelationViewRef.current.setRelations(relations);
        }
      })();
    }, [fromOriginal, fromModified, toOriginal, toModified, relations]);

    return (
      <div className="MonacoDiffEditorRelation">
        <div className="MonacoDiffEditorRelation__EditorList">
          <div
            className="MonacoDiffEditorRelation__EditorList__Item"
            ref={fromDiffEditorElRef}
          ></div>
          <div
            className="MonacoDiffEditorRelation__EditorList__Item"
            ref={toDiffEditorElRef}
          ></div>
        </div>
        <svg
          className="MonacoDiffEditorRelation__RelationSvg"
          ref={relationSvgElRef}
        ></svg>
      </div>
    );
  }
);

export default MonacoDiffEditorRelation;
